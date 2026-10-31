import { rename } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  TOPIC_IDS,
  TOPIC_REVISION,
  type Topic,
  validTitle,
  validTopics,
} from "../src/topics";
import { addMetadata, readDocument } from "./enrichment-markdown";
import {
  createTransport,
  type Field,
  object,
  ProviderError,
  type ProviderResult,
  parseScores,
  parseTitle,
  requestSpec,
  type Spec,
  selectTopics,
} from "./enrichment-providers";

export interface Options {
  cacheDir: string;
  concurrency: number;
  directory: string;
  dryRun: boolean;
  limit: number;
  progress?: (completed: number, total: number) => void;
  threshold: number;
  transport?: (spec: Spec) => Promise<ProviderResult>;
}

interface FieldRecord {
  cacheHit: boolean;
  completedAt: string;
  elapsedMs: number;
  key: string;
  model: string;
  retries: number;
  usage: Record<string, unknown>;
}

export interface Row {
  bodyHash?: string;
  changed: boolean;
  errors: string[];
  fields: Partial<Record<Field, FieldRecord>>;
  id: string;
  review: string[];
  scores?: Record<Topic, number>;
  sourceHash?: string;
  title?: string;
  topics?: Topic[];
  written: boolean;
}

export interface Report {
  completedAt: string;
  distribution: Record<Topic, number>;
  dryRun: boolean;
  rows: Row[];
  summary: {
    enriched: number;
    failed: number;
    processed: number;
    review: number;
    skipped: number;
    written: number;
  };
  threshold: number;
  topicRevision: string;
}

export function digest(value: string): string {
  return new Bun.CryptoHasher("sha256").update(value).digest("hex");
}

async function atomicWrite(path: string, content: string): Promise<void> {
  const temporary = `${path}.${crypto.randomUUID()}.tmp`;
  await Bun.write(temporary, content);
  await rename(temporary, path);
}

function parsedResponse(
  field: Field,
  response: Record<string, unknown>
): string | Record<Topic, number> {
  return field === "title" ? parseTitle(response) : parseScores(response);
}

function usageCounters(value: unknown): Record<string, number> {
  // Keep numeric accounting in reports; full provider usage stays in the cached
  // response, including provider-specific service/location descriptors.
  if (!value) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(object(value)).filter(
      (entry): entry is [string, number] => typeof entry[1] === "number"
    )
  );
}

function preserveExisting(field: Field, value: unknown, row: Row): void {
  if (field === "title" && validTitle(value)) {
    row.title = value;
  } else if (field === "topics" && validTopics(value)) {
    row.topics = value;
  } else {
    row.review.push(`invalid-existing-${field}`);
  }
}

function acceptValue(
  value: string | Record<Topic, number>,
  row: Row,
  additions: { title?: string; topics?: Topic[] },
  threshold: number
): void {
  if (typeof value === "string") {
    row.title = value;
    additions.title = value;
    return;
  }
  row.scores = value;
  const selection = selectTopics(value, threshold);
  row.topics = selection.topics;
  row.review.push(...selection.review);
  if (selection.topics.length > 0) {
    additions.topics = selection.topics;
  }
}

export async function enrich(options: Options): Promise<Report> {
  if (
    !Number.isFinite(options.threshold) ||
    options.threshold <= 0 ||
    options.threshold > 1 ||
    !Number.isInteger(options.limit) ||
    options.limit < 0 ||
    !Number.isInteger(options.concurrency) ||
    options.concurrency < 1 ||
    options.concurrency > 8
  ) {
    throw new Error(
      "Invalid threshold (0 < value <= 1), LIMIT (integer >= 0), or CONCURRENCY (1–8)"
    );
  }
  if (
    resolve(options.cacheDir) === resolve(options.directory) ||
    resolve(options.cacheDir).startsWith(`${resolve(options.directory)}/`)
  ) {
    throw new Error("Cache must be outside the Question directory");
  }
  const transport = options.transport ?? createTransport();
  const disabled = new Map<Field, string>();
  const names = (
    await Array.fromAsync(new Bun.Glob("*.md").scan(options.directory))
  ).sort();
  const selected = options.limit === 0 ? names : names.slice(0, options.limit);
  const rows: Row[] = new Array(selected.length);
  let next = 0;
  let completed = 0;

  async function fieldValue(
    field: Field,
    body: string,
    row: Row
  ): Promise<string | Record<Topic, number>> {
    const spec = requestSpec(field, body);
    const key = digest(JSON.stringify({ revision: TOPIC_REVISION, spec }));
    const path = join(options.cacheDir, `${key}.json`);
    try {
      const cached = object(await Bun.file(path).json());
      if (cached.key !== key) {
        throw new Error("Cache key mismatch");
      }
      const value = parsedResponse(field, object(cached.response));
      row.fields[field] = {
        ...object(cached.record),
        cacheHit: true,
        usage: usageCounters(object(cached.record).usage),
      } as unknown as FieldRecord;
      return value;
    } catch {
      // Missing, truncated, or invalid cache entries are recomputed, never trusted.
    }
    const reason = disabled.get(field);
    if (reason) {
      throw new ProviderError(reason, { permanent: true });
    }
    const start = performance.now();
    let result: ProviderResult;
    try {
      result = await transport(spec);
    } catch (error) {
      if (error instanceof ProviderError && error.permanent) {
        disabled.set(field, error.message);
      }
      throw error;
    }
    const value = parsedResponse(field, result.response);
    const record: FieldRecord = {
      cacheHit: false,
      completedAt: new Date().toISOString(),
      elapsedMs: Math.round(performance.now() - start),
      key,
      model: spec.model,
      retries: result.retries,
      usage: usageCounters(result.response.usage),
    };
    await atomicWrite(
      path,
      `${JSON.stringify({ key, record, response: result.response })}\n`
    );
    row.fields[field] = record;
    return value;
  }

  async function processFile(name: string): Promise<Row> {
    const row: Row = {
      changed: false,
      errors: [],
      fields: {},
      id: name.slice(0, -3),
      review: [],
      written: false,
    };
    const path = join(options.directory, name);
    try {
      const bytes = await Bun.file(path).bytes();
      const raw = new TextDecoder("utf-8", {
        fatal: true,
        ignoreBOM: true,
      }).decode(bytes);
      const document = readDocument(raw);
      row.sourceHash = digest(raw);
      row.bodyHash = digest(document.body);
      const additions: { title?: string; topics?: Topic[] } = {};
      await Promise.all(
        (["title", "topics"] as const).map(async (field) => {
          if (Object.hasOwn(document.data, field)) {
            preserveExisting(field, document.data[field], row);
            return;
          }
          try {
            const value = await fieldValue(field, document.body, row);
            acceptValue(value, row, additions, options.threshold);
          } catch (error) {
            // Never echo arbitrary exceptions/HTTP bodies; they may contain secrets.
            row.errors.push(
              `${field}: ${error instanceof ProviderError ? error.message : "Response validation or cache operation failed"}`
            );
          }
        })
      );
      const output = addMetadata(document, additions);
      row.changed = output !== raw;
      // A concurrent scraper/editor must never be overwritten, even in dry runs.
      if (digest(await Bun.file(path).text()) !== row.sourceHash) {
        throw new Error("Source changed during enrichment");
      }
      if (row.changed && !options.dryRun) {
        await atomicWrite(path, output);
        row.written = true;
      }
    } catch {
      row.errors.push(
        "Document validation or safe write failed; inspect source manually"
      );
    }
    return row;
  }

  async function worker(): Promise<void> {
    while (next < selected.length) {
      const index = next;
      next += 1;
      // biome-ignore lint/performance/noAwaitInLoops: A bounded worker checkpoints each file before taking the next.
      rows[index] = await processFile(selected[index]);
      completed += 1;
      options.progress?.(completed, selected.length);
    }
  }
  await Promise.all(Array.from({ length: options.concurrency }, worker));
  const distribution = Object.fromEntries(
    TOPIC_IDS.map((topic) => [
      topic,
      rows.filter((row) => row.topics?.includes(topic)).length,
    ])
  ) as Record<Topic, number>;
  return {
    completedAt: new Date().toISOString(),
    distribution,
    dryRun: options.dryRun,
    rows,
    summary: {
      enriched: rows.filter((row) => row.changed).length,
      failed: rows.filter((row) => row.errors.length > 0).length,
      processed: rows.length,
      review: rows.filter((row) => row.review.length > 0).length,
      skipped: rows.filter(
        (row) => !(row.changed || row.errors.length || row.review.length)
      ).length,
      written: rows.filter((row) => row.written).length,
    },
    threshold: options.threshold,
    topicRevision: TOPIC_REVISION,
  };
}

async function main(): Promise<void> {
  const { env } = process;
  if (env.DRY_RUN && !["0", "1"].includes(env.DRY_RUN)) {
    throw new Error("DRY_RUN must be 0 or 1");
  }
  const dryRun = env.DRY_RUN !== "0";
  if (!(dryRun || env.TOPIC_THRESHOLD)) {
    throw new Error(
      "Writes require an explicitly reviewed TOPIC_THRESHOLD; default 0.6 is dry-run only"
    );
  }
  const reportPath = resolve(
    env.REPORT_PATH ?? ".cache/enrichment/report.json"
  );
  const directory = new URL("../src/content/questions", import.meta.url)
    .pathname;
  if (reportPath.startsWith(`${directory}/`)) {
    throw new Error("Report must be outside the Question directory");
  }
  const report = await enrich({
    cacheDir: resolve(env.CACHE_DIR ?? ".cache/enrichment/responses"),
    concurrency: Number(env.CONCURRENCY ?? "2"),
    directory,
    dryRun,
    limit: Number(env.LIMIT ?? "0"),
    progress: (done, total) => {
      if (done % 10 === 0 || done === total) {
        console.log(`Enrichment ${done}/${total}`);
      }
    },
    threshold: Number(env.TOPIC_THRESHOLD ?? "0.6"),
  });
  await atomicWrite(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        dryRun,
        ...report.summary,
        distribution: report.distribution,
        report: reportPath,
      },
      null,
      2
    )
  );
  if (report.summary.failed > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Enrichment failed");
    process.exitCode = 1;
  }
}
