# Thirty-Question enrichment comparison

This experiment compares Haiku 5.5 generating Title and Topics together with full Cloudflare Clef assigning Topics and Haiku 5.5 generating Title separately. Keeping the same title model isolates the change in pipeline structure. It does not implement production enrichment or approve the vocabulary.

## Run

```sh
bun scraper/evaluation/compare.ts --prepare
bun test scraper/evaluation/core.test.ts
# After configuring the credentials below:
bun scraper/evaluation/compare.ts --run
# Rebuild the report from cached results without API calls:
bun scraper/evaluation/compare.ts --report
```

`--prepare` is the default and sends no network requests. `--run` requires all credentials before making any calls. It makes up to 90 calls: 30 combined Haiku, 30 full Clef, and 30 title-only Haiku. Successful API responses, including invalid model outputs, are cached after each call. Rerunning resumes matching cached requests; changing a payload or study revision creates a new request key and may incur new calls.

Bun loads the project `.env` automatically. Required variables:

```dotenv
ANTHROPIC_API_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

The Cloudflare token needs access to Workers AI for that account. `CLOUDFLARE_AUTH_TOKEN` is also accepted. Keep values local and never commit or paste them into chat. The runner does not create accounts, set secrets, deploy a Worker, or change the corpus.

## Outputs and review

Outputs are written to `docs/research/enrichment-comparison/`:

- `inputs.json`: source hashes, exact request payloads, draft topic definitions, and the sample manifest. Reference labels are present for review but excluded from the actual request bodies.
- `trials.json`: actual provider responses, usage, validation failures, and timings, created only by a live run. Authentication headers and credential values are never included.
- `report.md`: pending status or results, side-by-side titles/topics, usage, and review notes.

The fixed sample has 20 calibration and 10 held-out evaluation Questions. It includes all six hand-maintained historical cases, recent content, and misleading-keyword cases. The selected sample is deliberately diagnostic, not a random estimate of corpus-wide accuracy. Expectations and topic definitions in `study.json` were drafted by the agent before model calls; they need human review and are not authoritative gold labels.

Clef gets 26 independent yes/no questions. Its threshold is chosen only on calibration cases from a fixed candidate grid, maximizing micro F1 against draft labels and breaking ties by precision, then higher threshold. Predictions are capped at three Topics, and no low-confidence fallback is forced. Held-out metrics measure agreement with the draft labels; a zero-score label can still be a valid alternative that merits review. The sample does not have a positive example for every proposed Topic, so it cannot establish calibration or quality for all 26 Topics.

Review Title fidelity, specificity, the 60-character limit, disclosure of solutions, previous-answer contamination, and useful Topic distinctions manually. Inspect low-confidence and disagreement cases before choosing a provider. Do not approve a backfill or select a winner from schema validity, a single F1 number, or incomplete API results.

API details and primary evidence are in [the API note](../../docs/research/enrichment-evaluation-api.md); model research is in [the comparison note](../../docs/research/enrichment-model-selection.md). Source hashes are checked after the run to detect concurrent changes. The runner writes only the experiment outputs.
