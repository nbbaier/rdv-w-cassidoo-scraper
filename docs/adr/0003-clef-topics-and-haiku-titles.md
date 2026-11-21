---
status: accepted
---

# Use Clef for Topics and Haiku for Titles

On 2026-10-30, the maintainer selected full Clef (`@cf/cloudflare/clef`) for Topic assignment and Haiku 5.5 (`claude-haiku-5-5`) for Title generation after the [30-Question comparison](../research/enrichment-comparison/review.md). We accept two provider integrations over a single Haiku call because Clef selected fewer extra Topics and exposed low-confidence input for review; both approaches produced useful Titles. The small held-out sample and draft reference labels limit the strength of that evidence, and the provider choice does not approve the vocabulary or a corpus backfill.

## Consequences

- Keep Enrichment as the independent, idempotent pass defined by [ADR 0002](0002-enrichment-as-separate-idempotent-pass.md). Scraping and publishing must tolerate missing metadata or either provider failing.
- Ask Clef one yes/no question per approved Topic, using shared definitions. Select at most three qualifying Topics; when none qualifies, leave Topics absent and report the Question for review. A single exclusive choice would not implement multi-topic assignment.
- Topic policy settled on 2026-10-31: include subjects and data structures central to the Question, plus algorithmic techniques when explicitly requested or central rather than merely one possible solution. Allow up to three Topics and report low-confidence cases for review. `src/topics.ts` is the production candidate definition source; historical evaluation fixtures remain unchanged.
- The evaluated threshold of 0.6 remains provisional, separate from policy approval. Candidate definitions, the production threshold, and the full-corpus dry-run distribution require maintainer review before explicit approval of the write backfill.
- Generate a short, faithful Title separately with Haiku. Validate it locally and preserve any valid existing metadata; a failure in one field must not discard a valid value in the other.
- Run provider calls from the Bun enrichment job, not visitor requests. Keep the frontend static. Local credentials were exercised by the comparison; GitHub Actions secrets still require configuration before activation.
- Preserve Question bodies, dates, IDs, and the six hand-maintained historical files. Provider or vocabulary changes that retag existing Questions are deliberate migrations rather than silent overwrites.

The exact evaluated inputs, all scores and responses, and measurement limitations are retained in [the comparison artifacts](../research/enrichment-comparison/report.md). The independent production pass is now implemented; see [operations](../enrichment.md) and [the full-corpus dry run](../research/enrichment-dry-run/results.md). No archive metadata has been written. The write backfill and weekly activation remain pending maintainer review, and Actions credentials remain unverified.
