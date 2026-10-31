# Launch plan

> Tracked on GitHub Issues: spec [#11](https://github.com/nbbaier/rdv-w-cassidoo-scraper/issues/11), plans #12–#16. Status reconciled on 2026-10-30: #12 and #13 are complete; #14 is the next implementation slice. Deployment remains a separate maintainer activation step.

What this project is: a public, read-only archive of Cassidoo's weekly interview questions — the best way to browse and search them. Not a practice platform, community, or product (see [GLOSSARY.md](../GLOSSARY.md)). This supersedes the deleted 2026 roadmap (`docs/roadmap/`, in git history), which described a learning-platform vision that is no longer the goal.

## Launch cut, in order

1. **Cassidy confirmation — complete.** On 2026-10-30, the maintainer confirmed that Cassidy is happy for the project to continue. Outreach is no longer an unresolved prerequisite for implementation.
2. **Enrichment** — build `bun run enrich` per [ADR 0002](adr/0002-enrichment-as-separate-idempotent-pass.md): full Clef assigns Topics and Haiku 5.5 generates Titles, with a controlled topic vocabulary enforced by the content schema. Backfill the existing corpus after vocabulary approval, then run enrichment after `scrape` in the weekly workflow. Fields stay optional; UI degrades gracefully. The corpus count changes weekly as the Monday scrape adds new questions.
3. **UI** — titles on cards and question pages; topic filter beside the year filter; search index covers full question text + title (substring matching stays); `number` removed from display (date is the public identity); attribution + subscribe link on every question page and in the footer.
4. **Deploy** — Cloudflare, deploy-on-push from `main`, so the Monday scrape commit auto-publishes. Update the README when live.

## Current position and next slice

- **Complete:** Astro 7 upgrade (#12), date-based identity, attribution and subscribe links, and full-body substring search (#13).
- **Next:** implement the refreshed [enrichment plan #14](https://github.com/nbbaier/rdv-w-cassidoo-scraper/issues/14); titles and topic filtering (#15) follow. The old Anthropic-only plan is superseded by [ADR 0003](adr/0003-clef-topics-and-haiku-titles.md).
- **Model selection — complete:** on 2026-10-30, the maintainer selected full Clef (`@cf/cloudflare/clef`) for Topics and Haiku 5.5 (`claude-haiku-5-5`) for Titles after the 30-Question comparison. Credentials were verified in the live evaluation. See [ADR 0003](adr/0003-clef-topics-and-haiku-titles.md) and [measured results](research/enrichment-comparison/review.md).
- **Topic policy checkpoint:** the 26 definitions in [the evaluation study](../scraper/evaluation/study.json) remain a draft. Review the boundaries between subjects and optional solution techniques before freezing the vocabulary. The evaluated 0.6 threshold is a starting point, with at most three Topics and no forced choice when scores are low.
- **Backfill checkpoint:** approve the vocabulary and full-corpus dry-run distribution before writing metadata across the corpus. Questions with no accepted Topic stay untagged and are reported for review. Fields remain optional, and enrichment failure must not block scraping or publishing. GitHub Actions credentials still need configuration before weekly automation is activated.
- **Verification:** check optional schema compatibility, preserve question bodies byte-for-byte, and prove idempotency by comparing files before and after a second run. Existing unrelated working-tree changes are not an idempotency failure.

RSS remains the bulk ingestion source. The new static newsletter archive is useful for canonical links and completeness checks; an automated index check is not implemented yet. Existing Question IDs continue to use RSS publication dates rather than the static archive's Sunday URL dates. See [source comparison](research/static-newsletter-source.md).

## Post-launch queue (deferred deliberately)

- RSS feed of questions (one Astro endpoint)
- JSON export of the corpus (`search.json` is already most of this)
- Golden-file tests for `scraper/extract.ts` before the next time it's modified

Only revisit search (e.g. Pagefind) if real usage shows substring + topic filtering failing people.

## Explicit non-goals

Practice mode, user accounts, community solutions, analytics, AI coaching. The old roadmap's ideas were mined for the two items above; the rest are dead per the project identity.
