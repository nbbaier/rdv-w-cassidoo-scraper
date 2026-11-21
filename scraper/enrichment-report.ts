import { TOPIC_IDS } from "../src/topics";
import type { Report } from "./enrich";
import { selectTopics } from "./enrichment-providers";

const THRESHOLDS = [0.5, 0.6, 0.7, 0.8, 0.9];
const TABLE_SPECIAL = /[|\r\n]/gu;

function cell(text: string): string {
  return text
    .replace(TABLE_SPECIAL, " ")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderReport(report: Report): string {
  const { summary, rows } = report;
  const lines = [
    "# Full-corpus enrichment dry run",
    "",
    `Completed: ${report.completedAt}. Vocabulary: \`${report.topicRevision}\`. Threshold: **${report.threshold} (provisional)**. Dry run: **${report.dryRun}**.`,
    "",
    `Processed ${summary.processed}; proposed metadata additions ${summary.enriched}; skipped ${summary.skipped}; review ${summary.review}; failed ${summary.failed}; written ${summary.written}. Review and failure counts overlap with proposed additions: a valid Title may still be proposed when Topics abstain or fail.`,
    "",
    "The centrality policy is approved: subjects and data structures central to the Question, plus techniques explicitly requested or central rather than merely possible. At most three Topics; no forced fallback. The 26 definitions in src/topics.ts and operating threshold remain subject to the backfill review. Historical evaluation inputs and labels remain unchanged. These scores are model outputs, not calibrated probabilities of correctness or measured archive-wide accuracy.",
    "",
    "The companion JSON retains every Question ID, source/body hashes, proposed Title, all 26 scores, selected Topics, field cache keys, timestamps, usage, retries, and review/failure reasons. Raw successful responses remain in the ignored local response cache. Re-running uses that cache; changing the threshold does not repeat inference.",
    "",
    "## Topic distribution",
    "",
    "| Topic | Questions |",
    "| --- | ---: |",
    ...TOPIC_IDS.map((topic) => `| ${topic} | ${report.distribution[topic]} |`),
    "",
    "## Threshold sensitivity",
    "",
    "Computed from the same stored scores, without new requests. More-than-three counts are before capping; ambiguous means the third/fourth qualifying scores differ by at most 0.05. Near-threshold means any score is within 0.05 of the threshold. These flags expose review candidates rather than asserting bad assignments.",
    "",
    "| Threshold | Zero Topics | >3 qualifying | Near threshold | Ambiguous third | Total selected Topics |",
    "| ---: | ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const threshold of THRESHOLDS) {
    const selections = rows.flatMap((row) =>
      row.scores ? [selectTopics(row.scores, threshold)] : []
    );
    const count = (reason: string) =>
      selections.filter((item) => item.review.includes(reason)).length;
    lines.push(
      `| ${threshold} | ${count("zero-topics")} | ${count("more-than-three-qualify")} | ${count("near-threshold")} | ${count("ambiguous-third-topic")} | ${selections.reduce((sum, item) => sum + item.topics.length, 0)} |`
    );
  }
  lines.push(
    "",
    "## Review cases",
    "",
    "| Question | Proposed Title | Selected Topics | Reason |",
    "| --- | --- | --- | --- |"
  );
  for (const row of rows.filter((item) => item.review.length > 0)) {
    lines.push(
      `| [${row.id}](../../../src/content/questions/${row.id}.md) | ${cell(row.title ?? "absent")} | ${row.topics?.join(", ") || "absent"} | ${row.review.join(", ")} |`
    );
  }
  lines.push("", "## Failures", "");
  const failures = rows.filter((row) => row.errors.length > 0);
  if (failures.length === 0) {
    lines.push("None.");
  }
  for (const row of failures) {
    lines.push(`- ${row.id}: ${row.errors.map(cell).join("; ")}`);
  }
  lines.push(
    "",
    "## Provider usage",
    "",
    "Returned usage covers successful recorded responses, including cache hits; it is not an invoice or a count of fresh calls in this invocation.",
    "",
    "| Field | Recorded | Cache hits | Retried requests | Input tokens (incl. cache) | Output tokens |",
    "| --- | ---: | ---: | ---: | ---: | ---: |"
  );
  for (const field of ["title", "topics"] as const) {
    const records = rows.flatMap((row) =>
      row.fields[field] ? [row.fields[field]] : []
    );
    const tokens = (key: string) =>
      records.reduce(
        (sum, item) =>
          sum + (typeof item.usage[key] === "number" ? item.usage[key] : 0),
        0
      );
    lines.push(
      `| ${field} | ${records.length} | ${records.filter((item) => item.cacheHit).length} | ${records.filter((item) => item.retries > 0).length} | ${tokens("input_tokens") + tokens("cache_creation_input_tokens") + tokens("cache_read_input_tokens")} | ${tokens("output_tokens")} |`
    );
  }
  lines.push(
    "",
    "## Checkpoint",
    "",
    "Review the candidate vocabulary, Title faithfulness, distribution, zero-Topic/ambiguous cases, and threshold before approving a write backfill. A full write backfill and weekly activation remain unapproved. CI credentials have not been verified. No deployment is part of this work.",
    ""
  );
  return lines.join("\n");
}

if (import.meta.main) {
  const [, , path] = process.argv;
  if (!path?.endsWith(".json")) {
    throw new Error("Usage: bun scraper/enrichment-report.ts <report.json>");
  }
  const report = (await Bun.file(path).json()) as Report;
  const output = `${path.slice(0, -5)}.md`;
  await Bun.write(output, renderReport(report));
  console.log(output);
}
