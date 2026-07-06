# Launch plan

> Tracked on GitHub Issues: spec [#11](https://github.com/nbbaier/rdv-w-cassidoo-scraper/issues/11), plans #12–#16. Step 0 below (the note to Cassidy) is deliberately *not* an issue; it hard-gates #16 (deploy) via a STOP condition.

What this project is: a public, read-only archive of Cassidoo's weekly interview questions — the best way to browse and search them. Not a practice platform, community, or product (see [CONTEXT.md](../CONTEXT.md)). This supersedes the deleted 2026 roadmap (`docs/roadmap/`, in git history), which described a learning-platform vision that is no longer the goal.

## Launch cut, in order

1. **Note to Cassidy** — gate for everything below. Describe the intent (attributed, free, read-only archive with a subscribe link on every page) and confirm she's comfortable before sinking effort in.
2. **Enrichment** — build `bun run enrich` per [ADR 0002](adr/0002-enrichment-as-separate-idempotent-pass.md): controlled topic vocabulary frozen as a zod enum in `content.config.ts`, titles + topics backfilled across the existing question corpus with a cheap model, step added after `scrape` in the weekly workflow. Fields stay optional; UI degrades gracefully. The corpus count changes weekly as the Monday scrape adds new questions.
3. **UI** — titles on cards and question pages; topic filter beside the year filter; search index covers full question text + title (substring matching stays); `number` removed from display (date is the public identity); attribution + subscribe link on every question page and in the footer.
4. **Deploy** — Cloudflare, deploy-on-push from `main`, so the Monday scrape commit auto-publishes. Update the README when live.

## Post-launch queue (deferred deliberately)

- RSS feed of questions (one Astro endpoint)
- JSON export of the corpus (`search.json` is already most of this)
- Golden-file tests for `scraper/extract.ts` before the next time it's modified

Only revisit search (e.g. Pagefind) if real usage shows substring + topic filtering failing people.

## Explicit non-goals

Practice mode, user accounts, community solutions, analytics, AI coaching. The old roadmap's ideas were mined for the two items above; the rest are dead per the project identity.
