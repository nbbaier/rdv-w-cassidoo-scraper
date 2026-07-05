# Enrichment is a separate idempotent pass, not a scrape stage

Questions gain a `title` and `topics` (from a controlled vocabulary enforced as a zod enum) via an LLM-backed enrichment step. We considered enriching inline in `scrape.ts` but instead made enrichment a standalone script (`bun run enrich`) that scans `src/content/questions/` for files missing those fields and fills only those, running as an independent step after `scrape` in the weekly workflow.

Rationale: an LLM call on the scrape's critical path means an API hiccup blocks a question from publishing at all; as a separate self-healing pass, a failed enrichment just leaves the question untagged until the next run. It also keeps scraping deterministic (extraction from RSS) and enrichment lossy (inference) — preserving the "delete the file to re-scrape" contract — and the backfill of the pre-existing archive is the same script, not one-off code.

## Consequences

- `title` and `topics` are permanently optional in the content schema; the UI must degrade gracefully (excerpt fallback, no topic chip) when they're absent.
- Topic assignment uses a cheap model constrained to the predetermined vocabulary; adding a topic is a deliberate schema change.
