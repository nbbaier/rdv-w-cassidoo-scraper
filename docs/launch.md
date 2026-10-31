# Launch plan

> Tracked on GitHub Issues: spec [#11](https://github.com/nbbaier/rdv-w-cassidoo-scraper/issues/11), plans #12–#16. Status reconciled on 2026-10-30: #12 and #13 are complete; #14 is the next implementation slice. Deployment remains a separate maintainer activation step.

What this project is: a public, read-only archive of Cassidoo's weekly interview questions — the best way to browse and search them. Not a practice platform, community, or product (see [GLOSSARY.md](../GLOSSARY.md)). This supersedes the deleted 2026 roadmap (`docs/roadmap/`, in git history), which described a learning-platform vision that is no longer the goal.

## Launch cut, in order

1. **Cassidy confirmation — complete.** On 2026-10-30, the maintainer confirmed that Cassidy is happy for the project to continue. Outreach is no longer an unresolved prerequisite for implementation.
2. **Enrichment** — build `bun run enrich` per [ADR 0002](adr/0002-enrichment-as-separate-idempotent-pass.md): controlled topic vocabulary frozen as a zod enum in `content.config.ts`, titles + topics backfilled across the existing question corpus with a cheap model, step added after `scrape` in the weekly workflow. Fields stay optional; UI degrades gracefully. The corpus count changes weekly as the Monday scrape adds new questions.
3. **UI** — titles on cards and question pages; topic filter beside the year filter; search index covers full question text + title (substring matching stays); `number` removed from display (date is the public identity); attribution + subscribe link on every question page and in the footer.
4. **Deploy** — Cloudflare, deploy-on-push from `main`, so the Monday scrape commit auto-publishes. Update the README when live.

## Current position and next slice

- **Complete:** Astro 7 upgrade (#12), date-based identity, attribution and subscribe links, and full-body substring search (#13).
- **Next:** enrichment (#14), followed by titles and topic filtering (#15). The existing #14 plan must be refreshed for the selected model/provider before execution; its original Anthropic-only choice is under review.
- **Model selection:** compare a small generative model producing both Title and Topics with Cloudflare Clef assigning Topics plus a separate title generator. Use a representative sample before choosing the integration. See [model research](research/enrichment-model-selection.md).
- **Human checkpoints:** configure credentials for the chosen provider, review sample titles/topic assignments, and approve the controlled topic vocabulary before the corpus backfill. Fields remain optional, and enrichment failure must not block scraping or publishing.
- **Verification:** check optional schema compatibility, preserve question bodies byte-for-byte, and prove idempotency by comparing files before and after a second run. Existing unrelated working-tree changes are not an idempotency failure.

RSS remains the bulk ingestion source. The new static newsletter archive is useful for canonical links and completeness checks; an automated index check is not implemented yet. Existing Question IDs continue to use RSS publication dates rather than the static archive's Sunday URL dates. See [source comparison](research/static-newsletter-source.md).

## Post-launch queue (deferred deliberately)

- RSS feed of questions (one Astro endpoint)
- JSON export of the corpus (`search.json` is already most of this)
- Golden-file tests for `scraper/extract.ts` before the next time it's modified

Only revisit search (e.g. Pagefind) if real usage shows substring + topic filtering failing people.

## Explicit non-goals

Practice mode, user accounts, community solutions, analytics, AI coaching. The old roadmap's ideas were mined for the two items above; the rest are dead per the project identity.
