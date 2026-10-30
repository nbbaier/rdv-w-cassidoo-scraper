# Evaluating Cassidy's static newsletter archive as an ingestion source

Investigated 2026-10-30. This is a research note, not a decision replacing ADR 0001 or an implemented migration. The maintainer confirmed in this session that Cassidy is happy for the project to continue.

## Recommendation

Keep RSS as the bulk ingestion source and use Cassidy's static archive for canonical source links and completeness checks. A live comparison found the same 480 issue URLs in both sources, and the RSS links already point at her static archive. Static HTML did not fix the sampled historical extraction failure. Raw Markdown would be attractive, but the public repository linked from the announcement does **not** currently expose the newsletter corpus. A Markdown-based ingestion plan needs an actual accessible source URL first.

Keep the current generated question files and their date-based IDs during evaluation. In particular, preserve the six hand-maintained historical files. Changing the input source must not silently change question identity or lose those repairs.

## Confirmed source availability

- Cassidy's announcement describes one Markdown file per newsletter in a top-level `issues/` folder, with proposed frontmatter including `buttondownId`, `buttondownSlug`, `sourceUrl`, `issue`, `date`, `subject`, and `emoji`. It explicitly asks for Sunday-normalized canonical URLs and alternate-date redirects. These are details of her published implementation account, not fields independently read from a public source file. [1]
- The announcement's linked public repository, [`cassidoo/blahg`](https://github.com/cassidoo/blahg), describes itself as a **blog template**, and its README points to `blahg.netlify.app`. Its [`package.json`](https://github.com/cassidoo/blahg/blob/da923b6f8730192f6f5da5b3012443611565a7a8/package.json) has only dev/start/build/preview/Astro scripts; it has no newsletter sync scripts. The latest commit returned by GitHub was [`da923b6`, June 29, 2026](https://github.com/cassidoo/blahg/commit/da923b6f8730192f6f5da5b3012443611565a7a8), before the October archive announcement. [Template README](https://github.com/cassidoo/blahg/blob/da923b6f8730192f6f5da5b3012443611565a7a8/README.md)
- GitHub's contents API returned 404 for `issues/` and `issues/2026-10-25.md` on `cassidoo/blahg`'s default `main` branch. The recent issue path also returned 404 on the `tina` branch. Code and commit searches returned no newsletter implementation in that repository. This establishes that the described files were not found in the linked repository; it does not establish that no other public source exists.
- The older public [`cassidoo/cassidoo.github.io`](https://github.com/cassidoo/cassidoo.github.io) repository is also not a verified source: its latest returned commit was [January 2017](https://github.com/cassidoo/cassidoo.github.io/commit/533b248ad2776c8690dcd2eba393f5105bb9a020), and the recent issue path returned 404.

## Consequences for this project

- **Static HTML and raw Markdown are separate options.** A published static site is accessible without access to its source repository. HTML ingestion still needs question extraction; Markdown ingestion could avoid the historical HTML sectioning issue, but that benefit remains hypothetical until the files can be inspected.
- **Do not join records by date or ordinal alone.** Our [scraper](../../scraper/scrape.ts) uses the RSS publication date in UTC as the filename and feed position as an internal `number`. Cassidy's requested Sunday-normalized URL date is a different concept. Preserve existing IDs and reconcile using publication dates plus source links or a stable upstream ID where available. Do not mechanically rename Monday files to Sunday. Historical Buttondown URLs and current RSS canonical URLs also differ, so URL equality alone cannot join the old local frontmatter to the new source.
- **Do not repurpose `number`.** The glossary defines it as a synthetic internal ordinal. A publisher-provided issue number should have an explicit provenance and separate field if retained; matching numbers alone does not prove matching content.
- **Sync freshness needs checking.** Her published example schedules the upstream sync for Monday at 13:00 UTC, while our checked-in workflow runs Monday at 12:00 UTC. An unconditional switch could fetch before the upstream update. This schedule is evidence from her announcement's example, not a verified current deployed workflow. A migration should check freshness and retry or retain an RSS fallback. [2]
- **Question titles and topics remain separate work.** Her proposed `subject` is the newsletter subject, not a concise summary of the interview question. The new source does not by itself establish that the planned enrichment pipeline is unnecessary.
- **Change the ADR only after comparison.** ADR 0001 deliberately favors a single RSS request over index discovery plus per-issue fetching. Static archive ingestion reopens that tradeoff; it needs evidence of cleaner extraction, useful metadata, or better completeness.

## Live-page comparison

Read-only probes on 2026-10-30 fetched the [RSS feed](https://buttondown.com/cassidoo/rss?count=1000), [archive index](https://cassidoo.co/newsletter/archive/), and two individual issue pages. RSS was parsed with the installed `feedsmith`; HTML with the installed JSDOM. The existing `extractQuestion` was called directly; the scraper driver was not run, and no question files were written.

| Check | Observed result |
| --- | --- |
| RSS count versus unique dated links on the archive index | 480 versus 480; exact URL-set equality after removing trailing slashes |
| Local files matched to current RSS by UTC publication date | All 477 matched; current feed also includes October 12, 19, and 26, which this checkout lacks |
| Current RSS link target | Already the static archive: latest publication date `2026-10-26` links to `/newsletter/2026-10-25/`; oldest publication date `2017-04-01` links to `/newsletter/2017-04-02/` |
| Modern issue, `/newsletter/2026-10-25/` | Extracting from `.blog-post` succeeds, including the question and four code examples; RSS extraction also succeeds |
| Historical issue, `/newsletter/2017-10-01/` | Both `.blog-post` HTML and RSS input produce `skipped: answers-only`; the new page visibly contains the `reachable` question, so switching sources does not fix this known false negative |
| Passing a whole `<article>` to the current extractor | Fails with `no interview section` on both sampled pages; site chrome and its extra `<hr>` must be excluded |

The modern static page preserves a JavaScript code-fence language that the RSS extraction lacks and uses a curly apostrophe in introductory text. That is a small formatting benefit, not evidence of better question coverage. Only two individual pages were probed; no full body-by-body comparison or new extractor was implemented, and the other five hand-maintained historical cases were not tested.

The current driver uses each feed item's link when writing a **new** question, so it can already publish links to Cassidy's archive without a source change. Its existing-file skip means old frontmatter URLs will remain Buttondown links until a separate, intentional metadata update. This comparison proves issue-link coverage, not full content equivalence or correctness of every extracted question.

## Suggested next experiment

1. If pursuing a migration, extend the publication-date/source-link reconciliation into a full content comparison and report ambiguous or missing matches without modifying the corpus.
2. Capture fixtures for old and modern formats, particularly the six hand-maintained Questions, before modifying `extract.ts`.
3. Prototype static-source extraction into a temporary output directory and compare question bodies, examples, dates, and counts with the current corpus.
4. Decide from that comparison whether the static archive should be the primary source, a historical repair source, or a validation source. Keep enrichment independent as specified by ADR 0002.

**Sources**
[1] [https://cassidoo.co/post/static-newsletter-archive/](https://expand.land/s/01a18dc5-096e-706e-bd23-6ad3270433e9?id=1001)

[2] [https://cassidoo.co/post/static-newsletter-archive/](https://expand.land/s/01a18dc5-096e-706e-bd23-6ad3270433e9?id=1024)
