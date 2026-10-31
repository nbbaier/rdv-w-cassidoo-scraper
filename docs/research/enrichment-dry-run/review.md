# Enrichment backfill review checkpoint

Prepared 2026-10-31 for review of issue #14. No corpus metadata has been written, weekly enrichment remains gated, and deployment is outside this ticket.

## Evidence and result

All **480 Questions** were processed with full Clef for Topics and Haiku 5.5 for Titles. Both fields returned valid responses for all Questions: **960 successful field responses, zero final provider/validation failures**. A subsequent replay injected a transport that rejects any cache miss: all 960 responses came from cache, the proposals matched the live run, and no archive files were written. `results.json` captures that replay; the original responses and live-run report remain in ignored `.cache/enrichment/`.

At provisional **0.6**, 436 Questions have at least one proposed Topic; **44 (9.2%) abstain**. There are **150 distinct review cases (31.3%)**: 109 near the threshold, 11 with more than three qualifying Topics, and four with a close third/fourth choice, with overlap between reasons. The selected Topics total 745. Arrays (186), strings (134), and math (83) dominate; two-pointers receives zero assignments. This is a measured distribution, not a quality score.

See [the complete distribution, threshold comparison, review rows and usage](results.md), [all proposed metadata and scores](results.json), and [the 480 source fingerprints](source-verification.json). Every archive file was byte-identical to its pre-run fingerprint, including all six hand-maintained Questions. No evaluation fixtures or extraction code changed.

The approved policy includes central subjects/data structures and central or explicitly requested techniques, up to three Topics, with low-confidence review. `src/topics.ts` has 26 candidate definitions, tightened for dynamic-programming and hash-maps compared with the historical draft. Policy approval is settled; the candidate definitions, threshold and write backfill still need review.

## Observations from targeted source review

I compared 17 proposed Titles/Topic sets with their actual Question bodies: the six hand-maintained Questions, the oldest Question, two zero-Topic cases, three crowded/ambiguous cases, the hashmap implementation, a day-offset Question, and the three latest Questions. This is a diagnostic review, not a random quality estimate or approval of all 480 Titles.

| Question | Observation for the maintainer |
| --- | --- |
| 2017-10-09, 2017-10-16, 2018-01-22 | Queue implementation gets stacks-queues/data-structures; sorted-list majority gets arrays/searching without sorting; rope cutting gets arrays without dynamic-programming. These respect the approved centrality policy. |
| 2017-10-01 | Reachability gets geometry (0.914); math is below threshold (0.5739). The Title is faithful, but a second mathematical Topic is a threshold decision. |
| 2017-05-29 | Menu combinations abstains despite its list/map and combinatorics content (best score arrays 0.4248). Lowering only to 0.5 would still abstain. This is an underassignment candidate rather than a transport failure. |
| 2017-07-01 | Weather app architecture/UI abstains with every score below 0.09. The vocabulary has no app-design Topic; lowering the global threshold would not address that coverage gap well. No additional Topic is introduced by this implementation. |
| 2019-12-02 | Day-name plus offset abstains: strings 0.5993 and dates-times 0.5126. This is a useful concrete 0.5-versus-0.6 threshold review case. |
| 2019-01-29 | Boggle grid selects matrices/arrays/searching, with strings close to the third slot (0.7583 versus searching 0.7722). Arrays/matrices overlap consumes two of three slots; review that vocabulary boundary rather than treating the rank as authoritative. |
| 2024-12-16 | White elephant class selects games/simulation/data-structures, with probability fourth (0.7057). The Question explicitly requests random valid moves. Data-structures for a game class may be too broad; review its selection against probability. |
| 2025-07-14 | Vim cursor commands selects simulation/strings/parsing, with matrices close behind (0.6074). All are plausible under overlapping definitions; the three-Topic cap makes the boundary visible. |
| 2026-10-12, 2026-10-19, 2026-10-26 | Latest Topics are respectively arrays; strings/parsing/simulation; arrays. Optional solution techniques are less prominent than in the historical draft. This follows the stricter prompt, but the maintainer should review whether central dynamic-programming/graph structure is being missed. |

The sampled Titles describe their source tasks without proposing solutions or adding constraints. Formatting and faithfulness still need maintainer review across the remaining proposals; local validators enforce the 1–60-character, single-line shape, and the prompt requests sentence case. One unsampled-by-body Title spotted in the zero-Topic list uses lower-case “christmas” (2017-12-18); proper-name casing is not mechanically guaranteed. No generated Title or Topic has been accepted into the archive.

## Decision to make

Do not infer a production threshold from this unlabeled corpus distribution. At 0.5 there are 28 abstentions and 22 crowded assignments; at 0.6, 44 and 11; at 0.7, 70 and three. The tradeoff is coverage versus extra assignments. Retaining absent Topics is supported throughout the schema and pass.

Before a write backfill, review the candidate definitions (especially overlapping arrays/matrices and the technique boundaries), select the operating threshold, and explicitly approve writing. If definitions or prompts change, their request hashes invalidate affected inference; threshold-only review reuses all scores. The implementation preserves accepted metadata, so future retagging is a deliberate migration.

After backfill approval: perform the write, compare fingerprints across another pass to prove completed files are unchanged, then separately verify/configure Actions credentials and approve weekly activation. The checked-in weekly step has `continue-on-error: true` and requires `ENRICHMENT_ENABLED=true` plus an explicit `ENRICHMENT_TOPIC_THRESHOLD`; neither activation nor CI credential setup was performed here.

## Validation

- `bun test`: 33 passing tests, including byte preservation, CRLF, Unicode, partial/invalid/duplicate frontmatter, all six historical repairs, abstention, independent provider failures, bounded retries, cache corruption/resume, concurrent edits and repeat-write idempotency on temporary fixtures.
- `bun run check`: passes without warnings after keeping numeric usage counters in the report; full usage objects remain cached.
- `bun run check:astro`: passes with zero errors or warnings.
- `bun run build`: passes, 481 pages; astro-icon reports the existing absent `src/icons` directory while resolving the installed icon collection.
- Docker daemon is unavailable, so the Local CI container runner could not be used. The existing weekly workflow also performs scraping and Git writes; it was not run as a local validation side effect.
