# Enrichment operations

`bun run enrich` is an independent, idempotent Bun pass. It uses direct Cloudflare full Clef (`@cf/cloudflare/clef`) for Topics and direct Anthropic Haiku 5.5 (`claude-haiku-5-5`) for a Title. It never fetches newsletters or invokes the extractor. RSS ingestion, publication-date IDs, existing fields, and bodies remain intact. Both metadata fields are permanently optional.

## Settled Topic policy

Approved by the maintainer on 2026-10-31: include subjects and data structures central to the Question; include algorithmic techniques when explicitly requested or central, rather than merely one possible solution. Allow up to three Topics and report low-confidence cases for review.

`src/topics.ts` owns the candidate 26 definitions and policy, shared with the schema. The production candidates start from the evaluation definitions, with dynamic-programming and hash-maps tightened to exclude merely possible optimization/frequency-counting solutions. Historical `scraper/evaluation/study.json` and comparison artifacts remain faithful to that experiment. Policy approval does **not** approve the operating threshold, every definition, or a full write backfill. The evaluated 0.6 remains provisional.

## Dry run and review

```sh
bun run enrich
LIMIT=20 bun run enrich
REPORT_PATH=docs/research/enrichment-dry-run/results.json bun run enrich
bun scraper/enrichment-report.ts docs/research/enrichment-dry-run/results.json
```

Default `DRY_RUN=1` performs inference and caches successful validated responses, but writes no Question files. `LIMIT=0` (default) scans all files; a positive integer bounds the oldest-first filename window, including already complete files. `CONCURRENCY=2` bounds files in flight (each may make two independent requests); valid range 1–8. `TOPIC_THRESHOLD` defaults to 0.6 in dry runs only; it must be finite and greater than zero through one. `CACHE_DIR` defaults to `.cache/enrichment/responses`; `REPORT_PATH` defaults to `.cache/enrichment/report.json`.

Local credentials are automatically loaded by Bun from `.env`: `ANTHROPIC_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (or `CLOUDFLARE_AUTH_TOKEN`). Values never belong in reports or logs. Neither a provider SDK nor a gateway is required. The direct requests follow the verified contracts in [the API note](research/enrichment-evaluation-api.md).

Successful responses are checkpointed atomically per field, with a SHA-256 key covering the body, exact prompt/definitions, vocabulary revision, model, and API version. Threshold changes reuse all Clef scores. Invalid/truncated cache files are recomputed; failed provider responses are never accepted as completed work. Deleting the ignored response cache forces fresh inference only for still-missing fields. Reclassification of accepted metadata requires a deliberate migration.

Reports include proposed Titles, all Topic scores, selected Topics, distribution, hashes, usage, retry counts, and per-file failures/review reasons. Zero qualifying scores leave Topics absent. Scores within 0.05 of the threshold, more than three qualifying Topics, and a third/fourth score gap of at most 0.05 are review flags. A nonzero failure count exits 1 after finishing other work. Review cases alone do not fail the pass. Counts overlap: a Title can succeed while Topics require review.

Missing fields are filled independently; valid existing fields are preserved and incur no request. Invalid existing values (including explicit null/empty Topics) are preserved and reported for manual review, without duplicate keys or silent replacement. Malformed/duplicate/unsafe YAML and detected source changes prevent writing that file. New metadata is appended to the original frontmatter; the body and original YAML text are never serialized again. The six hand-maintained Questions are handled like other existing files and are never deleted or regenerated.

Question replacements acquire an exclusive `<question>.md.enrichment.lock`, prepare the temporary file, then compare the source again immediately before a synchronous rename. Competing enrichment writes fail closed. Normal success/failure removes the temporary file and releases the lock; an existing lock is never removed by a competing writer. A process killed mid-write may leave a lock: verify no enrichment process is active before manually removing that specific lock and retrying. Locks are advisory for enrichment processes; external editors do not honor them, so avoid simultaneous editing during an approved write pass. The final comparison/rename has no asynchronous gap, but it is not an operating-system compare-and-swap against arbitrary external writers.

Requests have a 60-second timeout covering headers and body and at most three attempts, retrying network/stream errors (including interruptions while reading the body), HTTP 429 and HTTP 5xx with bounded exponential delays. A fully read body containing invalid JSON is rejected without retrying it as a transport failure. Authentication/configuration failures disable that field for the rest of the invocation after in-flight requests finish; the other provider continues. Provider error bodies and arbitrary exceptions are not echoed. Clef unsuccessful envelopes and Haiku refusals/truncation are rejected.

## Write checkpoint and automation

**Stop before the full write backfill until the maintainer reviews the corpus dry run, candidate definitions, Title quality, zero/ambiguous cases and threshold, and explicitly approves writing.** The approved command then sets both `DRY_RUN=0` and the reviewed `TOPIC_THRESHOLD`; there is no write-mode threshold default. Do not run that command as part of preparing the review.

After approval and the backfill, take file fingerprints immediately before and after another write invocation. Completed valid metadata must produce no writes or calls; abstained Topics remain absent and cached until the threshold/vocabulary is deliberately revised. Fixture tests already exercise this sequence without changing the archive.

The weekly workflow has a dormant enrichment step after `scrape`, `continue-on-error: true`, response caching, and a review-report artifact. It runs only when repository variable `ENRICHMENT_ENABLED` equals `true`, and write mode requires `ENRICHMENT_TOPIC_THRESHOLD`. Leave both activation and the full write backfill pending review. Before enabling, separately configure/verify Actions secrets `ANTHROPIC_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`. Local credentials do not establish that Actions secrets exist. No secrets/variables were configured by this implementation.

Weekly ingestion retains default `COUNT=1000`; enrichment failure does not prevent new Questions being committed. Commits with newly added files name their dates; metadata-only changes use “Enrich interview question metadata”. This workflow does not deploy the site.

Run `bun test`, `bun run check`, `bun run check:astro`, and `bun run build` to validate changes.
