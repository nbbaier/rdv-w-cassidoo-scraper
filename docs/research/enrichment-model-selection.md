# Model selection for question enrichment

Researched 2026-10-30 against current provider documentation. No model calls or paid evaluations were run, so the fit assessments below are recommendations to test, not measured quality results. This revisits issue #14's July choice of `claude-haiku-4-5`; it does not implement a provider change.

## Workload and decision

Each Question needs a short specific Title and 1–3 Topics from a fixed vocabulary, returned as validated JSON. The script must preserve the question body, retry incomplete metadata in later runs, and keep weekly scraping independent of model failures, per ADR 0002.

Prefer one current inexpensive general model for both fields unless a separate classifier demonstrates a useful quality or operational advantage. At this corpus size, simplicity, title quality, topic consistency, and credential availability matter more than a few cents of token-price difference. Validate on a representative 30-Question sample before selecting a default and freezing the vocabulary.

### Corpus measurements and cost assumptions

The reconciled checkout contains 480 Questions. Their Markdown bodies total 179,102 characters; the median is 352, the 95th percentile 716, and the maximum 1,190. These are local character measurements, not provider token counts.

As an illustrative budget, assume 250,000 total input tokens including repeated instructions/schema and 30,000 visible output tokens for the entire corpus. Standard usage would cost about $0.04 with Haiku 5.5 or GPT-6 Luna, $0.11 with Gemini 3.1 Flash-Lite, and $0.40 with the old Haiku 4.5 choice. These are arithmetic estimates, not measured bills; reasoning, tokenizer differences, retries, account funding minimums, and taxes are excluded. A full dry run followed by a separate backfill repeats generation costs unless results are cached.

Clef has a different request shape: 26 per-topic instructions can increase input tokens compared with one compact generative schema. At 250,000 input tokens, Clef topic classification alone would cost about $0.06 and Clef-flash about $0.01 before any free allowance; title generation remains an additional call. This estimate cannot establish which approach is cheaper without measuring both serialized prompts and actual usage.

## Anthropic and Google candidates

Prices are USD per million text tokens for standard paid API use, followed by batch prices; caching, free-tier quotas, taxes, retries, and thinking-token overhead are excluded.

| Model / API ID | Standard input / output | Batch input / output | Assessment |
| --- | --- | --- | --- |
| Claude Haiku 5.5 / `claude-haiku-5-5` | $0.10 / $0.50 for prompts up to 100K tokens | $0.05 / $0.25 | Current Anthropic candidate; classification and extraction are documented target uses. [1][2] |
| Claude Haiku 4.5 / `claude-haiku-4-5` | $1.00 / $5.00 | $0.50 / $2.50 | Old plan's choice; current small-model pricing makes it unattractive without a demonstrated quality advantage. [1][2] |
| Gemini 3.1 Flash-Lite / `gemini-3.1-flash-lite` | $0.25 / $1.50 | $0.125 / $0.75 | Stable Google candidate with structured outputs and Batch support. [3][4][5] |
| Gemini 2.5 Flash-Lite / `gemini-2.5-flash-lite` | $0.10 / $0.40 | $0.05 / $0.20 | Older price comparator, not a default recommendation without a lifecycle check and sample evaluation. [6][7] |

Haiku 5.5's exact API ID is fixed and has no date suffix or separate alias. [8] Its default adaptive thinking uses medium effort; for this task, test thinking disabled or low effort, cap output, and inspect actual usage before the full run. [9][10][16] Sampling parameters such as `temperature` must be omitted on Haiku 5.5, and its tokenizer counts approximately 30% more tokens than Haiku 4.5 for the same text. [9][11]

Gemini 3.1 Flash-Lite is listed as stable and supports structured output and Batch. [5] Its documented classification/data-extraction use case fits this task, although that is a provider capability claim rather than evidence of title/topic accuracy on this corpus. [12] Paid and free tiers have different data-use terms; the pricing tables mark free usage as usable for product improvement and paid usage as not used for that purpose. [3] Account-specific rate limits apply per project, and advertised capacity is not guaranteed; a free tier should therefore be treated as an evaluation option rather than a reliability guarantee for GitHub Actions. [Google rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

## Structured-output details that affect implementation

- Anthropic supports string enums and `minItems: 1`, but array constraints beyond `minItems` 0 or 1 are unsupported; enforce the maximum of three Topics and deduplicate locally. [13][14]
- Google enforces `minItems` and `maxItems`, but ignores `uniqueItems`; the application must still deduplicate and validate the final Title/Topics. [15]
- Structured JSON controls shape and permitted values; it does not prove that the chosen Topics describe the Question well or that a generated Title is useful, so human review of the sample remains necessary.
- Use a regular API request for the weekly single Question initially; a batch workflow adds asynchronous job state to save only half of an already small token bill, so introduce it only if actual backfill costs justify it.

## OpenAI comparison

GPT-6 Luna (`gpt-6-luna`) is the current small OpenAI candidate at $0.10 input and $0.50 output per million tokens. [17] It supports structured outputs, and `reasoning.effort: "none"` is available; its default effort is medium, so set the intended effort explicitly when evaluating this short task. [18][19] OpenAI Batch offers a 50% discount and a completion window of up to 24 hours. [20]

These documented capabilities make Luna a reasonable comparison model, not a proven winner for this corpus. Haiku 5.5 matches its listed standard token prices. An existing working credential for either provider would be a practical tiebreaker after checking output quality.

## Cloudflare Clef and a separate topic classifier

Clef (`@cf/cloudflare/clef`) returns probabilities over permitted answers for typed questions; it does not generate arbitrary new text. It therefore fits controlled Topic assignment but cannot write the required short Title. [21]

For multi-topic classification, ask one independent yes/no (`noul`) question per Topic, with a short definition of that Topic. The proposed 26 Topics fit within the documented 64-question request limit. A single `choice` question would pick one option rather than directly implementing the desired multi-label assignment. [22][23]

After scoring, select at most three Topics above a threshold chosen from reviewed examples. Do not assume a score of 0.9 means 90% corpus accuracy. If no Topic passes, flag the Question for review or leave enrichment incomplete for retry rather than force an irrelevant Topic. Topic descriptions should distinguish the prompt's subject from one optional solution strategy: e.g. a string Question need not be assigned dynamic programming merely because that is one possible approach.

Current listed rates are $0.240 per million input tokens for Clef and $0.038 for Clef-flash; neither charges for output tokens. [24][25] Workers AI includes 10,000 free Neurons per day, but actual shared account usage and model request tokenization determine whether an evaluation fits in that allocation. [28] The cost difference at this corpus size is too small to decide between full Clef and Flash before comparing classification quality.

The REST API can be called from Bun in the existing GitHub Actions job using a Cloudflare account ID and scoped API token. Hosting the static frontend on Cloudflare does not require moving enrichment into a public Worker or into visitor requests. [26] Preserve the separate, optional enrichment pass from ADR 0002.

If keeping title generation on Workers AI is desirable, `@cf/qwen/qwen3.8-27b` is one documented generative candidate at $0.45 input / $3.20 output per million tokens. Its documented reasoning default is `xhigh`; evaluate an explicit low setting for this task. Its corpus-specific title quality and schema behavior were not tested here. [27]

**Recommendation:** include Clef as the topic-classification challenger in the first sample evaluation. Compare it with Haiku 5.5 producing both Title and Topics in one call. Prefer the single-model implementation if Topic quality is comparable; adopt separate Clef classification if it improves relevance, exposes useful review signals, or maintaining one Cloudflare account is a meaningful operational preference. No provider is selected by this research note.

## Evaluation before choosing

Use the same 30 Questions, Title instructions, and provisional Topic definitions for each finalist. Include historical loose formatting, code-heavy examples, math questions, ambiguous multi-topic questions, and recent entries. Review Title specificity, factual fidelity, Topic relevance, Topic consistency, duplicate/empty Topics, schema validity, latency, and actual billed tokens. Record the model ID and prompt/vocabulary revision with the results. Keep the full backfill blocked on the maintainer's vocabulary approval.

**Sources**

[1] [Anthropic standard pricing](https://expand.land/s/01a18dcb-b7c2-76cd-8c0d-75a73e639f99?id=4882)

[2] [Anthropic batch pricing](https://expand.land/s/01a18dcb-b7c2-76cd-8c0d-75a73e639f99?id=5206)

[3] [Gemini 3.1 Flash-Lite standard pricing](https://expand.land/s/01a18dcb-a66f-73de-838f-2a44137c187e?id=13660)

[4] [Gemini 3.1 Flash-Lite batch pricing](https://expand.land/s/01a18dcb-a66f-73de-838f-2a44137c187e?id=13689)

[5] [Gemini 3.1 Flash-Lite stable version and capabilities](https://expand.land/s/01a18dcc-4f70-7778-a5d0-89bc2a7d9a22?id=3549)

[6] [Gemini 2.5 Flash-Lite standard pricing](https://expand.land/s/01a18dcb-a66f-73de-838f-2a44137c187e?id=14720)

[7] [Gemini 2.5 Flash-Lite batch pricing](https://expand.land/s/01a18dcb-a66f-73de-838f-2a44137c187e?id=14749)

[8] [Claude Haiku 5.5 fixed model ID](https://expand.land/s/01a18dcd-2e42-77ac-a893-9c6af5101686?id=2013)

[9] [Claude Haiku 5.5 defaults](https://expand.land/s/01a18dcb-f784-77a8-81ec-f7c25535ee72?id=1719)

[10] [Claude effort levels](https://expand.land/s/01a18dcc-9442-700d-9baa-e0e9f6f866ee?id=3561)

[11] [Claude Haiku 5.5 tokenizer](https://expand.land/s/01a18dcb-f784-77a8-81ec-f7c25535ee72?id=1602)

[12] [Gemini data-extraction use case](https://expand.land/s/01a18dcc-4f70-7778-a5d0-89bc2a7d9a22?id=3582)

[13] [Anthropic supported schema features](https://expand.land/s/01a18dcb-d440-7189-838a-04145f5e8664?id=4855)

[14] [Anthropic unsupported array constraints](https://expand.land/s/01a18dcb-d440-7189-838a-04145f5e8664?id=4875)

[15] [Google array constraints](https://expand.land/s/01a18dcc-4f5f-76ae-9581-f3405f75af96?id=18534)

[16] [Disabling Claude thinking](https://expand.land/s/01a18dcc-9442-700d-9baa-e0e9f6f866ee?id=3650)

[17] [GPT-6 Luna prices](https://expand.land/s/01a18dcc-f018-765b-a5a0-c673715d0b46?id=6496)

[18] [GPT-6 Luna reasoning controls](https://expand.land/s/01a18dcc-f018-765b-a5a0-c673715d0b46?id=6508)

[19] [GPT-6 Luna structured outputs](https://expand.land/s/01a18dcc-f018-765b-a5a0-c673715d0b46?id=6599)

[20] [OpenAI Batch discount and turnaround](https://expand.land/s/01a18dcb-b2d9-732d-bfce-33c0f34969e1?id=11048)

[21] [Clef decision output](https://expand.land/s/01a18dcc-4136-712a-8882-0239d2d4edfe?id=2102)

[22] [Clef request limits](https://expand.land/s/01a18dcc-4136-712a-8882-0239d2d4edfe?id=2167)

[23] [Clef typed-question example](https://expand.land/s/01a18dcc-4136-712a-8882-0239d2d4edfe?id=2145)

[24] [Current Clef and Clef-flash rates](https://expand.land/s/01a18dcc-5d6d-7074-811a-71a35b2e42e8?id=2844)

[25] [Clef output billing](https://expand.land/s/01a18dcc-4136-712a-8882-0239d2d4edfe?id=2124)

[26] [Clef REST API example](https://expand.land/s/01a18dcc-4136-712a-8882-0239d2d4edfe?id=2149)

[27] [Workers AI Qwen 3.8 pricing and reasoning](https://expand.land/s/01a18dcd-16a8-752b-ac3d-1f588c173050?id=3139)

[28] [Workers AI daily allocation](https://expand.land/s/01a18dcc-5d6d-7074-811a-71a35b2e42e8?id=2541)
