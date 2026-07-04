# Test Suite Foundation

**Category:** Testing | Technical Debt
**Quarter:** Q1
**T-shirt Size:** M

## Why This Matters

The project has **zero test coverage**. No unit tests, no integration tests, no end-to-end tests. This is a significant risk for a project that:

1. Runs automated scraping on external websites (Buttondown can change anytime)
2. Parses complex HTML structures with heuristic logic
3. Generates content that feeds directly into production
4. Has a weekly CI/CD pipeline that could silently break

Without tests, every change is a gamble. The scraper's `wrapContentBetweenHRs()` function in `scraper/utils.ts` uses intricate DOM manipulation—if Buttondown changes their newsletter format, the scraper will fail silently or produce garbage. The weekly GitHub Action will commit broken content automatically.

Testing isn't just about code quality—it's about confidence. Confidence to refactor. Confidence to add features. Confidence that the weekly automation won't embarrass anyone.

## Current State

- `bun test` is referenced in `AGENTS.md` but no test files exist
- No `*.test.ts` or `*.spec.ts` files anywhere in the codebase
- Scraper logic in `scraper/utils.ts` has multiple failure modes with no validation
- Content schema validation in `src/content/config.ts` catches some issues at build time, but not scraping failures
- GitHub Action in `.github/workflows/weekly-scrape.yml` has no validation step before commit

## Proposed Future State

A comprehensive test suite providing:

1. **Unit tests** for all scraper utilities (date formatting, HTML parsing, content extraction)
2. **Snapshot tests** for HTML→Markdown conversion to catch regressions
3. **Integration tests** for the full scrape→generate→validate pipeline
4. **Content validation tests** ensuring all markdown files conform to schema
5. **E2E tests** for critical frontend paths (search, pagination, navigation)
6. **CI integration** running tests before any deploy

The test suite should:
- Run in <30 seconds for developer feedback
- Catch scraper failures before they reach production
- Validate content integrity on every commit
- Alert on breaking changes to external dependencies

## Key Deliverables

- [ ] Set up Bun's built-in test runner with proper configuration
- [ ] Write unit tests for `scraper/utils.ts` functions:
  - [ ] `formatDate()` with various input formats
  - [ ] `wrapContentBetweenHRs()` with edge cases
  - [ ] `getQuestion()` with mock HTML responses
- [ ] Create fixture files with sample newsletter HTML for deterministic testing
- [ ] Add snapshot tests for HTML→Markdown conversion stability
- [ ] Implement content validation script to check all markdown files
- [ ] Add integration test for scraper pipeline with mocked network
- [ ] Set up Playwright or similar for E2E frontend testing
- [ ] Update GitHub Action to run tests before committing new content
- [ ] Add pre-commit hook for running tests locally
- [ ] Create test coverage reporting and set minimum threshold (aim for 80%+)

## Prerequisites

None—this can start immediately and should run in parallel with other initiatives.

## Risks & Open Questions

- Test maintenance burden: Tests need to be updated when features change
- Mocking strategy: How to mock Buttondown responses without hitting real API?
- Flakiness: E2E tests can be flaky; need robust retry logic
- Time investment: Building a test suite takes time away from features—but prevents future pain
- Snapshot management: HTML structure changes will require snapshot updates

## Notes

- Bun has a built-in test runner (`bun test`) that's Jest-compatible—no extra deps needed
- The `scraper/data/html/` cache contains real HTML samples for creating fixtures
- Consider using `msw` (Mock Service Worker) for network mocking
- Playwright works well with Astro for E2E testing
- Reference files: `scraper/utils.ts`, `scraper/index.ts`, `.github/workflows/weekly-scrape.yml`
- Buttondown's HTML structure has been stable, but a single change could break everything
