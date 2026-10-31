# Launch plan

> Tracked on GitHub Issues: spec [#11](https://github.com/nbbaier/rdv-w-cassidoo-scraper/issues/11), plans #12–#16. Status reconciled on 2026-10-31: #12 and #13 are complete; #14 implementation is prepared with the write-backfill checkpoint still open. Deployment remains a separate maintainer activation step.

What this project is: a public, read-only archive of Cassidoo's weekly interview questions — the best way to browse and search them. Not a practice platform, community, or product (see [GLOSSARY.md](../GLOSSARY.md)). This supersedes the deleted 2026 roadmap (`docs/roadmap/`, in git history), which described a learning-platform vision that is no longer the goal.

## Launch cut, in order

1. **Cassidy confirmation — complete.** On 2026-10-30, the maintainer confirmed that Cassidy is happy for the project to continue. Outreach is no longer an unresolved prerequisite for implementation.
2. **Enrichment** — build `bun run enrich` per [ADR 0002](adr/0002-enrichment-as-separate-idempotent-pass.md): full Clef assigns Topics and Haiku 5.5 generates Titles, with a controlled topic vocabulary enforced by the content schema. Backfill only after explicit approval of the candidate definitions, threshold, and full-corpus dry run, then activate enrichment after `scrape` in the weekly workflow. Fields stay optional; UI degrades gracefully. The corpus count changes weekly as the Monday scrape adds new questions.
3. **UI** — titles on cards and question pages; topic filter beside the year filter; search index covers full question text + title (substring matching stays); `number` removed from display (date is the public identity); attribution + subscribe link on every question page and in the footer.
4. **Deploy** — Cloudflare, deploy-on-push from `main`, so the Monday scrape commit auto-publishes. Update the README when live.

## Current position and next slice

- **Complete:** Astro 7 upgrade (#12), date-based identity, attribution and subscribe links, and full-body substring search (#13).
- **Next:** review the prepared implementation and corpus dry run for [enrichment plan #14](https://github.com/nbbaier/rdv-w-cassidoo-scraper/issues/14); titles and topic filtering (#15) follow. The old Anthropic-only plan is superseded by [ADR 0003](adr/0003-clef-topics-and-haiku-titles.md).
- **Model selection — complete:** on 2026-10-30, the maintainer selected full Clef (`@cf/cloudflare/clef`) for Topics and Haiku 5.5 (`claude-haiku-5-5`) for Titles after the 30-Question comparison. Credentials were verified in the live evaluation. See [ADR 0003](adr/0003-clef-topics-and-haiku-titles.md) and [measured results](research/enrichment-comparison/review.md).
- **Topic policy — settled, 2026-10-31:** include subjects and data structures central to the Question; include algorithmic techniques when explicitly requested or central, rather than merely one possible solution. Up to three Topics, with low-confidence cases reported for review. The 26 candidate definitions now live in `src/topics.ts`; historical evaluation fixtures remain unchanged. Policy approval does not approve the threshold or backfill.
- **Backfill checkpoint:** review [the full-corpus dry run](research/enrichment-dry-run/results.md), approve the candidate definitions and operating threshold, then explicitly approve writing metadata across the corpus. Questions with no accepted Topic stay untagged and are reported for review. Fields remain optional, and enrichment failure must not block scraping or publishing. GitHub Actions credentials remain unverified; the prepared weekly enrichment step stays gated behind the unset `ENRICHMENT_ENABLED` repository variable. See [operations](enrichment.md).
- **Verification:** check optional schema compatibility, preserve question bodies byte-for-byte, and prove idempotency by comparing files before and after a second run. Existing unrelated working-tree changes are not an idempotency failure.

RSS remains the bulk ingestion source. The new static newsletter archive is useful for canonical links and completeness checks; an automated index check is not implemented yet. Existing Question IDs continue to use RSS publication dates rather than the static archive's Sunday URL dates. See [source comparison](research/static-newsletter-source.md).

## Post-launch queue (deferred deliberately)

- RSS feed of questions (one Astro endpoint)
- JSON export of the corpus (`search.json` is already most of this)
- Golden-file tests for `scraper/extract.ts` before the next time it's modified

Only revisit search (e.g. Pagefind) if real usage shows substring + topic filtering failing people.

## Explicit non-goals

Practice mode, user accounts, community solutions, analytics, AI coaching. The old roadmap's ideas were mined for the two items above; the rest are dead per the project identity.
