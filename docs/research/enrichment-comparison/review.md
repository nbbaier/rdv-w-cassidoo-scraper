# Review of the 30-Question enrichment comparison

Completed 2026-10-30. All 90 authorized inference calls returned valid output: 30 Haiku 5.5 combined Title/Topics calls, 30 full Clef Topic calls, and 30 separate Haiku 5.5 Title calls. No archive content or production metadata was changed. This is an agent review of actual outputs; the reference labels and vocabulary still await maintainer approval.

## Recommendation

**Maintainer decision, 2026-10-30:** Clef + Haiku is the selected approach. This accepts the provider direction below; the vocabulary and backfill checkpoints remain pending.

Clef is a reasonable provisional choice for Topic assignment, paired with Haiku for Title generation. In this sample it favored core subjects over optional implementation techniques, produced fewer extra Topics, and exposed one ambiguous case through low scores. The measured cost and latency differences are too small for this archive to outweigh Topic quality.

The advantage is promising rather than decisive: the held-out set has only ten Questions, reference labels are agent-authored, and several alternate labels are defensible. Approve the Topic definitions and review the examples below before freezing the vocabulary or authorizing a corpus backfill. No production provider configuration was changed by this comparison.

## Method and measured results

The prepared sample and reference labels were fixed before inference. Both candidates received the same Question bodies and 26 Topic definitions; reference labels and review notes were omitted from requests. Twenty cases calibrated a single global Clef threshold, and ten cases were held out. The selected threshold was **0.6**, with at most three Topics and no forced fallback.

| Held-out metric, 10 Questions | Haiku combined | Clef Topics |
| --- | ---: | ---: |
| Topic precision | 0.783 | 0.900 |
| Topic recall | 0.818 | 0.818 |
| Topic micro F1 | 0.800 | 0.857 |
| True-positive labels | 18 | 18 |
| Extra labels versus draft reference | 5 | 2 |
| Missing reference labels | 4 | 4 |
| Explicitly forbidden Topic selections | 0 | 0 |

Across all thirty cases, Haiku had precision/recall/F1 of 0.826/0.864/0.844; Clef had 0.915/0.818/0.864. These aggregate figures include calibration cases and are descriptive, not held-out estimates. Clef returned no Topic above threshold for one case; Haiku returned at least one Topic for all thirty. All 60 generated Titles met the nonempty/60-character check, and all returned Topic structures passed validation.

No study labels, thresholds, or prompts were changed after looking at held-out results. The sample is diagnostic, deliberately including historical repairs and misleading keywords. It does not establish quality for every Topic, probability calibration, run-to-run stability, or archive-wide accuracy. The observed 0.6 threshold is a provisional operating point for this study, not an approved production constant.

## Examples that matter

| Question | Observation | Implication |
| --- | --- | --- |
| [Regex matcher, 2019-07-10](../../../src/content/questions/2019-07-10.md) | Clef chose `strings`, `regex`, `parsing`. Haiku chose `strings`, `recursion`, `dynamic-programming`. | Clef better matched the explicitly requested subject; Haiku preferred possible solution techniques despite the prompt policy. |
| [Linked-list copy, 2022-07-11](../../../src/content/questions/2022-07-11.md) | Clef chose `linked-lists`; Haiku additionally chose `hash-maps`. | Clef was more conservative about an optional implementation detail. Both avoided the misleading `probability` Topic for random pointers. |
| [Pine-tree printing, 2017-12-18](../../../src/content/questions/2017-12-18.md) | Clef's highest score was `strings` at 0.3619, so it abstained. Haiku chose `strings`, `simulation`. Both Titles identified the current pine-tree task despite previous-week stack-answer contamination. | Low scores expose a useful review case, but a complete pipeline must handle abstention. Keep it untagged for review rather than silently forcing the highest-scored Topic. |
| [CIDR containment, 2021-07-12](../../../src/content/questions/2021-07-12.md) | Clef kept only `parsing`; Haiku included `bit-manipulation`, which the draft reference expected. | Clef's conservative threshold can omit useful concepts. Its precision advantage comes with a recall tradeoff on the full sample. |
| [Word counter without regex, 2017-09-05](../../../src/content/questions/2017-09-05.md) | Neither classifier selected `regex`; Clef retained only `strings`, while Haiku also included `parsing`. | Both handled an explicit prohibition correctly. Whether parsing belongs here is partly a Topic-policy decision. |

Some reference disagreements should not be treated as objective mistakes. `math` on rope subtraction is defensible; Boggle can reasonably be described by a grid/graph subject without the `games` Topic; and sorting a set of intervals can be a solution technique rather than the requested subject. The draft vocabulary mixes subjects, data structures, and algorithms, so these boundaries need a maintainer decision before the backfill. The recorded labels were preserved rather than adjusted to favor a model.

## Title review

Both paths used the same Haiku model for Titles, with combined versus title-only prompts. Most outputs are specific and faithful. The separate title step showed no systematic quality advantage. Two title-only outputs merit edits:

- `2017-10-23`: “Pick x numbers whose pairwise differences divide by y” is less precise than the combined output's “differences divisible by y.” Preserve the divisibility relation explicitly.
- `2017-12-18`: “Print a Christmas tree of N rows (interview question)” adds avoidable boilerplate. The combined Title is cleaner.

Capitalization and terminology vary in both paths. A later title prompt should specify one case style and exclude generic “interview question” suffixes. This comparison did not alter the prompts and rerun cases to optimize these examples.

## Usage, latency, and priced estimate

| Stage | Recorded input tokens | Output tokens | Sum of request wall times | List-rate estimate |
| --- | ---: | ---: | ---: | ---: |
| Haiku combined | 52,978 | 1,200 | 34.591 s | $0.00590 |
| Clef Topics | 99,072 | 0 | 16.935 s | $0.02378 |
| Haiku Title only | 15,058 | 856 | 30.494 s | $0.00193 |
| Clef + Haiku Title pipeline | 114,130 | 856 | 47.429 s | $0.02571 |

The priced estimate applies the researched standard rates: Haiku $0.10 input/$0.50 output per million tokens and Clef $0.24 per million input tokens. [Model/pricing sources](../enrichment-model-selection.md) It is arithmetic applied to measured usage, not an invoice. Cloudflare's free daily allocation, other account usage, taxes, credits, and any provider-billed failed requests can change the bill. Anthropic reported zero thinking and cache tokens in these responses. Recorded inference across both pipelines totals about **$0.03161 at list rates**.

Clef's 26 typed questions make its input substantially larger than the Question body. Its median classification request took 520 ms; Haiku combined's median was 1,079 ms, and title-only Haiku's was 919 ms. The hybrid adds a second request, so the sum of request times was higher even though classification alone was faster. These are one-run observations excluding authentication troubleshooting, report formatting, and idle time; they are not a controlled latency benchmark.

## Evidence and next decision

- [Generated side-by-side report](report.md)
- [Exact prepared inputs and source hashes](inputs.json)
- [Raw provider responses, all Topic scores, usage, and timings](trials.json)
- [Sample definitions and draft reference labels](../../../scraper/evaluation/study.json)

Cloudflare initially rejected two requests with HTTP 401. After the maintainer corrected credentials, all 30 Clef cases completed. The stage selector allowed the Haiku work to finish independently and the final run reused cached responses. Credentials and authentication headers were not written into experiment artifacts.

The next decision is whether to accept this provisional Clef/Haiku direction and clarify the Topic policy. A full backfill, production enrichment integration, deployment, and vocabulary approval remain outside this completed comparison.
