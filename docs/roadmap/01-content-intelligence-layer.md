# Content Intelligence Layer

**Category:** New Feature | Architecture
**Quarter:** Q1
**T-shirt Size:** L

## Why This Matters

The archive currently stores questions as flat markdown with minimal metadata (url, date, number). This is a fundamental limitation—users can't filter by difficulty, browse by topic, or find questions similar to ones they've practiced. Content intelligence transforms this from a simple archive into a curated learning resource. Every feature downstream (search, learning paths, analytics, recommendations) depends on having rich, structured metadata.

This initiative is foundational. Without understanding *what* each question is about, *how hard* it is, and *what skills* it tests, the project remains a flat chronological list. With intelligence, it becomes a living curriculum.

## Current State

- Content schema in `src/content/config.ts` captures only: `url`, `date`, `number`
- Questions lack: difficulty ratings, topic tags, programming language hints, prerequisite concepts
- No categorization exists—435 questions are effectively unsorted
- Search in `QuestionsApp.astro` is text-matching only, with no semantic understanding
- The scraper in `scraper/utils.ts` extracts raw content without analysis

## Proposed Future State

Every question in the archive has:

1. **Difficulty rating** (1-5 scale) derived from problem complexity indicators
2. **Topic tags** (arrays, strings, trees, graphs, dynamic programming, recursion, etc.)
3. **Skill tags** (problem decomposition, edge case handling, optimization, etc.)
4. **Programming language hints** (language-agnostic vs. language-specific)
5. **Estimated time to solve** (15 min, 30 min, 1 hour)
6. **Related questions** (similar problems for progressive practice)
7. **Concept prerequisites** (what you should know before attempting)

The enriched schema enables:
- "Show me medium-difficulty tree problems"
- "Find questions similar to this one"
- "What should I practice before attempting graph problems?"

## Key Deliverables

- [ ] Extend content schema in `src/content/config.ts` with new metadata fields
- [ ] Create AI-powered analysis pipeline (using Claude or GPT-4) to classify existing questions
- [ ] Build manual override system for human curation of AI classifications
- [ ] Backfill all 435 existing questions with enriched metadata
- [ ] Update scraper pipeline in `scraper/utils.ts` to auto-classify new questions on ingestion
- [ ] Create admin interface for reviewing and adjusting classifications
- [ ] Add filtering UI to `QuestionsApp.astro` for difficulty and topics
- [ ] Implement "similar questions" feature on individual question pages
- [ ] Create topic taxonomy documentation for consistency

## Prerequisites

None—this is the foundational initiative that enables many others.

## Risks & Open Questions

- AI classification accuracy: May need human review for ~20% of questions initially
- Taxonomy design: Need to balance granularity vs. usability (too many tags = unusable)
- Backward compatibility: Existing questions need graceful handling of new required fields
- Cost: AI API calls for 435+ questions during backfill; need to budget for ongoing new questions
- Subjectivity: Difficulty ratings are inherently subjective—whose perspective do we optimize for?

## Notes

- Consider using Claude's batch API for cost-effective backfill
- The `defuddle` library in `scraper/utils.ts` already extracts clean markdown—can pipe to analysis
- Similar projects (LeetCode, HackerRank) use difficulty + topic as primary navigation
- Could crowdsource difficulty ratings from community once solutions feature exists
- Reference files: `src/content/config.ts`, `scraper/utils.ts`, `src/components/QuestionsApp.astro`
