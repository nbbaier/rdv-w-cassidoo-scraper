import { afterEach, describe, expect, test as it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TOPIC_IDS, type Topic } from "../src/topics";
import { digest, enrich, type Options } from "./enrich";
import { addMetadata, readDocument } from "./enrichment-markdown";
import {
  createTransport,
  ProviderError,
  parseScores,
  parseTitle,
  requestSpec,
  type Spec,
  selectTopics,
} from "./enrichment-providers";

const roots: string[] = [];
const SOURCE =
  '---\nurl: "https://example.com/newsletter"\ndate: 2017-10-01\nnumber: 42 # preserve this comment\n---\n\n**Question** é 🐝\n\n```js\nconst x = "---";\n```\n\n';
const TITLE = {
  content: [{ text: '{"title":"Count the bees"}', type: "text" }],
  stop_reason: "end_turn",
  usage: { input_tokens: 100, output_tokens: 10 },
};

function scores(
  overrides: Partial<Record<Topic, number>> = { strings: 0.9 }
): Record<Topic, number> {
  return Object.fromEntries(
    TOPIC_IDS.map((topic) => [topic, overrides[topic] ?? 0.1])
  ) as Record<Topic, number>;
}

function clef(
  overrides?: Partial<Record<Topic, number>>
): Record<string, unknown> {
  return {
    answers: Object.fromEntries(
      Object.entries(scores(overrides)).map(([topic, noul]) => [
        topic,
        { noul, type: "noul" },
      ])
    ),
    model: "clef",
    usage: { input_tokens: 500, output_tokens: 0 },
  };
}

async function failureMessage(action: Promise<unknown>): Promise<string> {
  const error = await action.then(
    () => undefined,
    (cause: unknown) => cause
  );
  if (!(error instanceof Error)) {
    throw new Error("Expected a rejected Error");
  }
  return error.message;
}

async function fixture(
  raw = SOURCE
): Promise<{ options: Options; path: string }> {
  const root = await mkdtemp(join(tmpdir(), "cassidoo-enrich-"));
  roots.push(root);
  const directory = join(root, "questions");
  const path = join(directory, "2017-10-01.md");
  await Bun.write(path, raw);
  return {
    options: {
      cacheDir: join(root, "cache"),
      concurrency: 1,
      directory,
      dryRun: true,
      limit: 0,
      threshold: 0.6,
      transport: (spec) =>
        Promise.resolve({
          response: spec.field === "title" ? TITLE : clef(),
          retries: 0,
        }),
    },
    path,
  };
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true }))
  );
});

describe("byte-preserving metadata extension", () => {
  it.each([
    SOURCE,
    SOURCE.replaceAll("\n", "\r\n"),
    SOURCE.trimEnd(),
    SOURCE.replace("---\n\n**Question**", "---\n\n---\n**Question**"),
  ])(
    "preserves body, existing fields, comments and newline conventions",
    (raw) => {
      const document = readDocument(raw);
      const output = addMetadata(document, {
        title: 'A title: "quoted"',
        topics: ["strings"],
      });
      expect(Buffer.from(readDocument(output).body)).toEqual(
        Buffer.from(document.body)
      );
      expect(output.startsWith(raw.slice(0, document.insertAt))).toBe(true);
      expect(readDocument(output).data).toEqual({
        ...document.data,
        title: 'A title: "quoted"',
        topics: ["strings"],
      });
      expect(() =>
        addMetadata(readDocument(output), { title: "Replace it" })
      ).toThrow("Refusing to replace");
    }
  );

  it("rejects missing, malformed, duplicate, or unsafe YAML", () => {
    for (const raw of [
      "No YAML",
      "---\n[bad\n---\nbody",
      "---\ntitle: First\ntitle: Second\n---\nbody",
      "---\n{number: 1}\n---\nbody",
    ]) {
      expect(() => readDocument(raw)).toThrow();
    }
  });

  it("all six historical repairs survive fixture enrichment byte-for-byte", async () => {
    const { options } = await fixture();
    const ids = [
      "2017-10-01",
      "2017-10-09",
      "2017-10-16",
      "2017-10-23",
      "2018-01-22",
      "2018-07-16",
    ];
    const originals = await Promise.all(
      ids.map((id) =>
        Bun.file(
          new URL(`../src/content/questions/${id}.md`, import.meta.url)
        ).text()
      )
    );
    await Promise.all(
      ids.map((id, index) =>
        Bun.write(join(options.directory, `${id}.md`), originals[index])
      )
    );
    const result = await enrich({ ...options, dryRun: false });
    expect(result.summary.written).toBe(6);
    const outputs = await Promise.all(
      ids.map((id) => Bun.file(join(options.directory, `${id}.md`)).text())
    );
    outputs.forEach((output, index) => {
      expect(readDocument(output).body).toBe(
        readDocument(originals[index]).body
      );
      expect(readDocument(output).data.date).toEqual(
        readDocument(originals[index]).data.date
      );
    });
  });
});

describe("independent enrichment and checkpoints", () => {
  it("dry run, cache-only resume/write, then idempotent second write", async () => {
    const { options, path } = await fixture();
    const dry = await enrich(options);
    expect(dry.summary).toEqual({
      enriched: 1,
      failed: 0,
      processed: 1,
      review: 0,
      skipped: 0,
      written: 0,
    });
    expect(await Bun.file(path).text()).toBe(SOURCE);
    const noRequests = () => {
      throw new Error("Cache miss");
    };
    const written = await enrich({
      ...options,
      dryRun: false,
      transport: noRequests,
    });
    expect(written.summary.written).toBe(1);
    expect(written.rows[0].fields.title?.cacheHit).toBe(true);
    const before = digest(await Bun.file(path).text());
    const second = await enrich({
      ...options,
      dryRun: false,
      transport: noRequests,
    });
    expect(second.summary.skipped).toBe(1);
    expect(second.summary.written).toBe(0);
    expect(digest(await Bun.file(path).text())).toBe(before);
  });

  it("a corrupt response checkpoint is retried independently", async () => {
    const { options } = await fixture();
    const first = await enrich(options);
    const key = first.rows[0].fields.title?.key;
    await Bun.write(join(options.cacheDir, `${key}.json`), "{truncated");
    const calls: string[] = [];
    const resumed = await enrich({
      ...options,
      transport: (spec) => {
        calls.push(spec.field);
        return Promise.resolve({ response: TITLE, retries: 0 });
      },
    });
    expect(calls).toEqual(["title"]);
    expect(resumed.rows[0].fields.topics?.cacheHit).toBe(true);
    expect(resumed.summary.failed).toBe(0);
  });

  it.each(["title", "topics"] as const)(
    "only fills missing fields when %s exists",
    async (field) => {
      const raw = addMetadata(
        readDocument(SOURCE),
        field === "title"
          ? { title: "Keep this title" }
          : { topics: ["arrays"] }
      );
      const { options, path } = await fixture(raw);
      const calls: string[] = [];
      const report = await enrich({
        ...options,
        dryRun: false,
        transport: (spec) => {
          calls.push(spec.field);
          return Promise.resolve({
            response: spec.field === "title" ? TITLE : clef(),
            retries: 0,
          });
        },
      });
      expect(calls).toEqual([field === "title" ? "topics" : "title"]);
      expect(report.summary.written).toBe(1);
      expect(readDocument(await Bun.file(path).text()).data[field]).toEqual(
        readDocument(raw).data[field]
      );
    }
  );

  it("invalid existing metadata is reported and preserved without duplicate keys", async () => {
    const raw = SOURCE.replace("number: 42", "title: null\nnumber: 42");
    const { options, path } = await fixture(raw);
    const report = await enrich({ ...options, dryRun: false });
    expect(report.rows[0].review).toEqual(["invalid-existing-title"]);
    expect(readDocument(await Bun.file(path).text()).data.title).toBeNull();
    expect(report.rows[0].fields.title).toBeUndefined();
  });

  it("abstains without empty Topics and reuses scores for another threshold", async () => {
    const { options, path } = await fixture();
    const transport = (spec: Spec) =>
      Promise.resolve({
        response: spec.field === "title" ? TITLE : clef({ strings: 0.55 }),
        retries: 0,
      });
    const report = await enrich({ ...options, dryRun: false, transport });
    expect(report.rows[0].review).toContain("zero-topics");
    expect(
      Object.hasOwn(readDocument(await Bun.file(path).text()).data, "topics")
    ).toBe(false);
    const retry = await enrich({
      ...options,
      threshold: 0.5,
      transport: () => {
        throw new Error("Must use cache");
      },
    });
    expect(retry.rows[0].topics).toEqual(["strings"]);
    expect(retry.rows[0].fields.topics?.cacheHit).toBe(true);
  });

  it.each(["title", "topics"] as const)(
    "%s failure does not discard the other field; later resume retries only failure",
    async (failed) => {
      const { options, path } = await fixture();
      const first = await enrich({
        ...options,
        dryRun: false,
        transport: (spec) => {
          if (spec.field === failed) {
            throw new ProviderError("Provider HTTP 503");
          }
          return Promise.resolve({
            response: spec.field === "title" ? TITLE : clef(),
            retries: 0,
          });
        },
      });
      expect(first.summary.failed).toBe(1);
      expect(first.summary.written).toBe(1);
      const { data } = readDocument(await Bun.file(path).text());
      expect(Object.hasOwn(data, failed)).toBe(false);
      const called: string[] = [];
      const resumed = await enrich({
        ...options,
        dryRun: false,
        transport: (spec) => {
          called.push(spec.field);
          return Promise.resolve({
            response: spec.field === "title" ? TITLE : clef(),
            retries: 0,
          });
        },
      });
      expect(called).toEqual([failed]);
      expect(resumed.summary.failed).toBe(0);
    }
  );

  it("body changes invalidate cache; concurrent edits are preserved", async () => {
    const { options, path } = await fixture();
    await enrich(options);
    const updated = `${SOURCE}New text\n`;
    await Bun.write(path, updated);
    let calls = 0;
    const report = await enrich({
      ...options,
      dryRun: false,
      transport: async (spec) => {
        calls += 1;
        await Bun.write(path, `${updated}User edit\n`);
        return {
          response: spec.field === "title" ? TITLE : clef(),
          retries: 0,
        };
      },
    });
    expect(calls).toBe(2);
    expect(report.summary.failed).toBe(1);
    expect(report.summary.written).toBe(0);
    expect(await Bun.file(path).text()).toContain("User edit");
  });

  it("permanent auth failures stop repeated calls for that field", async () => {
    const { options } = await fixture();
    await Bun.write(
      join(options.directory, "2017-10-09.md"),
      `${SOURCE}second`
    );
    let titleCalls = 0;
    const report = await enrich({
      ...options,
      transport: (spec) => {
        if (spec.field === "title") {
          titleCalls += 1;
          throw new ProviderError("Provider HTTP 401", { permanent: true });
        }
        return Promise.resolve({ response: clef(), retries: 0 });
      },
    });
    expect(titleCalls).toBe(1);
    expect(report.summary.failed).toBe(2);
    expect(report.rows.every((row) => row.topics?.length === 1)).toBe(true);
  });

  it("LIMIT bounds files; invalid settings cannot silently write", async () => {
    const { options } = await fixture();
    await Bun.write(join(options.directory, "2017-10-09.md"), SOURCE);
    expect((await enrich({ ...options, limit: 1 })).summary.processed).toBe(1);
    expect(
      await failureMessage(enrich({ ...options, threshold: Number.NaN }))
    ).toContain("Invalid threshold");
    expect(
      await failureMessage(enrich({ ...options, cacheDir: options.directory }))
    ).toContain("Cache must be outside");
  });
});

describe("direct provider contracts", () => {
  it("constructs Title-only Haiku and 26 independent Clef questions", () => {
    const title = requestSpec("title", "Untrusted body");
    expect(title.model).toBe("claude-haiku-5-5");
    expect(title.body.thinking).toEqual({ type: "disabled" });
    expect(JSON.stringify(title.body.output_config)).not.toContain('"topics"');
    const topics = requestSpec("topics", "Untrusted body");
    expect(topics.model).toBe("@cf/cloudflare/clef");
    expect(Object.keys(topics.body.questions as object)).toHaveLength(26);
    expect(topics.body.state).toBe("Untrusted body");
  });

  it("rejects missing/invalid scores, refusals, truncation and invalid titles", () => {
    expect(parseScores(clef()).strings).toBe(0.9);
    expect(parseTitle(TITLE)).toBe("Count the bees");
    for (const value of [Number.NaN, -1, 1.1, "0.9"]) {
      expect(() =>
        parseScores({
          answers: {
            ...(clef().answers as object),
            strings: { noul: value, type: "noul" },
          },
        })
      ).toThrow();
    }
    expect(() => parseScores({ answers: {} })).toThrow();
    for (const response of [
      { ...TITLE, stop_reason: "max_tokens" },
      { ...TITLE, stop_reason: "refusal" },
      { ...TITLE, stop_details: { type: "refusal" } },
      { ...TITLE, content: [{ text: '{"title":""}', type: "text" }] },
    ]) {
      expect(() => parseTitle(response)).toThrow();
    }
  });

  it("caps Topics at three and reports low-confidence boundaries", () => {
    const result = selectTopics(
      scores({
        arrays: 0.9,
        geometry: 0.59,
        math: 0.7,
        numbers: 0.71,
        strings: 0.8,
      }),
      0.6
    );
    expect(result.topics).toEqual(["arrays", "strings", "numbers"]);
    expect(result.review).toEqual([
      "more-than-three-qualify",
      "near-threshold",
      "ambiguous-third-topic",
    ]);
  });

  it("retries transient HTTP failures, parses REST envelopes and uses direct API headers", async () => {
    const seen: RequestInit[] = [];
    let calls = 0;
    const fetcher = ((url: string, init: RequestInit) => {
      expect(url).toContain(
        "api.cloudflare.com/client/v4/accounts/account/ai/run/@cf/cloudflare/clef"
      );
      seen.push(init);
      calls += 1;
      return Promise.resolve(
        calls < 3
          ? new Response("Busy", { status: 429 })
          : Response.json({ result: clef(), success: true })
      );
    }) as unknown as typeof fetch;
    const transport = createTransport({
      env: {
        CLOUDFLARE_ACCOUNT_ID: "account",
        CLOUDFLARE_AUTH_TOKEN: "fixture-token",
      },
      fetcher,
      sleep: () => Promise.resolve(),
    });
    const result = await transport(requestSpec("topics", "body"));
    expect(result.retries).toBe(2);
    expect(parseScores(result.response).strings).toBe(0.9);
    expect(seen[0].headers).toEqual({
      Authorization: "Bearer fixture-token",
      "Content-Type": "application/json",
    });
  });

  it.each([401, 403, 503, 200])(
    "handles HTTP %s and non-JSON without exposing response contents",
    async (status) => {
      let calls = 0;
      const fetcher = (() => {
        calls += 1;
        return Promise.resolve(
          new Response("sensitive-provider-message", { status })
        );
      }) as unknown as typeof fetch;
      const transport = createTransport({
        env: { ANTHROPIC_API_KEY: "fixture-token" },
        fetcher,
        sleep: () => Promise.resolve(),
      });
      expect(
        await failureMessage(transport(requestSpec("title", "body")))
      ).toContain(status === 200 ? "invalid JSON" : `HTTP ${status}`);
      expect(calls).toBe(status === 503 ? 3 : 1);
    }
  );

  it("configuration failure makes no requests; unsuccessful envelopes are rejected", async () => {
    const missing = createTransport({
      env: {},
      fetcher: (() => {
        throw new Error("No call allowed");
      }) as unknown as typeof fetch,
    });
    expect(
      await failureMessage(missing(requestSpec("title", "body")))
    ).toContain("Missing ANTHROPIC_API_KEY");
    const transport = createTransport({
      env: {
        CLOUDFLARE_ACCOUNT_ID: "account",
        CLOUDFLARE_API_TOKEN: "fixture-token",
      },
      fetcher: (() =>
        Promise.resolve(
          Response.json({
            errors: [{ code: 10_000, message: "secret" }],
            result: null,
            success: false,
          })
        )) as unknown as typeof fetch,
    });
    expect(
      await failureMessage(transport(requestSpec("topics", "body")))
    ).toContain("codes: 10000");
  });

  it("network failures are bounded and do not expose thrown request details", async () => {
    let calls = 0;
    const transport = createTransport({
      env: { ANTHROPIC_API_KEY: "fixture-token" },
      fetcher: (() => {
        calls += 1;
        return Promise.reject(new Error("sensitive-token-in-exception"));
      }) as unknown as typeof fetch,
      sleep: () => Promise.resolve(),
    });
    expect(
      await failureMessage(transport(requestSpec("title", "body")))
    ).toContain("network/timeout failure after 3 attempts");
    expect(calls).toBe(3);
  });
});
