# Full-Text Search Engine

**Category:** Performance | DX Improvement
**Quarter:** Q1
**T-shirt Size:** M

## Why This Matters

The current search implementation in `QuestionsApp.astro` is a client-side text filter that:

1. Loads a JSON index of 435+ questions on every page load
2. Performs naive string matching against excerpts (150 characters only)
3. Cannot search within full question content
4. Has no ranking or relevance scoring
5. Doesn't support advanced queries (AND, OR, phrase matching)

As the archive grows (8+ years of weekly questions), this approach becomes increasingly problematic. Users searching for "dynamic programming" get results where those words appear anywhere, not ranked by relevance. Searching for "binary tree traversal" requires all three words to appear in the 150-char excerpt.

Full-text search transforms discoverability. Users can find the exact question they remember ("the one about reversing a linked list in place") instantly.

## Current State

- `src/pages/search.json.ts` generates a build-time index with: slug, date, number, excerpt (200 chars)
- `QuestionsApp.astro` fetches this JSON and filters client-side with `includes()`
- Search matches against: excerpt, date, number, slug
- Full question content (code examples, detailed descriptions) is not searchable
- No typo tolerance, no synonyms, no relevance ranking
- Index grows linearly with question count (~50KB currently, will double)

## Proposed Future State

A proper search experience powered by Pagefind (ideal for static sites) or Algolia:

1. **Full-content indexing**: Search across entire question text, including code examples
2. **Relevance ranking**: Best matches appear first
3. **Typo tolerance**: "bianry tree" still finds "binary tree"
4. **Faceted filtering**: Combine search with difficulty/topic filters
5. **Instant results**: Sub-100ms response times
6. **Highlighted snippets**: Show matching text in context
7. **Progressive enhancement**: Works without JavaScript (basic form submission fallback)

The search should feel like searching Google or Algolia-powered docs sites—instant, intelligent, and always helpful.

## Key Deliverables

- [ ] Evaluate and choose search solution (Pagefind recommended for static sites)
- [ ] Integrate Pagefind into Astro build pipeline
- [ ] Configure indexing to include full question content with proper weighting
- [ ] Design and implement new search UI component with keyboard navigation
- [ ] Add highlighted result snippets showing matching text
- [ ] Implement debounced search-as-you-type
- [ ] Add faceted search combining text query with filters (difficulty, topic, year)
- [ ] Create dedicated search results page for deep linking
- [ ] Optimize bundle size (Pagefind UI is ~5KB gzipped)
- [ ] Add search analytics to track popular queries (feeds into content strategy)
- [ ] Remove legacy `search.json` endpoint and client-side filtering code

## Prerequisites

None required, but pairs well with **Content Intelligence Layer** (enables faceted search by topic/difficulty).

## Risks & Open Questions

- Build time impact: Full-text indexing adds ~10-30 seconds to build
- Index size: Full content indexing increases static asset size
- Hosting: Some CDNs have limits on static file sizes
- SEO: Need to ensure search results pages are crawlable
- Accessibility: Search UI must be keyboard-navigable and screen-reader friendly

## Notes

- Pagefind is specifically designed for static sites and integrates seamlessly with Astro
- Alternative: Algolia offers more features but requires external service and has usage limits
- The `search.json` in `src/pages/search.json.ts` can be removed once Pagefind is integrated
- Consider adding "Did you mean...?" suggestions for common typos
- Reference files: `src/pages/search.json.ts`, `src/components/QuestionsApp.astro`
- Pagefind docs: https://pagefind.app/
