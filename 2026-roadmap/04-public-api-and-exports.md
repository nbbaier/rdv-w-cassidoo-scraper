# Public API & Data Exports

**Category:** Architecture | Integration
**Quarter:** Q1
**T-shirt Size:** M

## Why This Matters

The Cassidoo question archive is a unique dataset—8+ years of curated interview questions from one of tech's most beloved newsletter authors. Currently, this data is locked inside a static website. Developers can't:

1. Build their own practice apps using these questions
2. Import questions into flashcard systems (Anki, RemNote)
3. Create browser extensions that show daily challenges
4. Integrate with LLM-powered tutoring systems
5. Analyze trends in interview question patterns

A public API transforms this project from a destination website into a **platform**. Third-party developers can build on top of it, extending reach and impact far beyond what a single team could achieve.

This also establishes the project as the canonical source for Cassidoo questions—if others want this data, they should get it from here, not by scraping the newsletter themselves.

## Current State

- Questions exist only as markdown files in `src/content/questions/`
- `search.json` endpoint provides limited metadata (slug, date, number, excerpt)
- No versioning, no rate limiting, no documentation
- No standard export formats (JSON, CSV, RSS, etc.)
- Content is technically accessible but not designed for programmatic consumption

## Proposed Future State

A well-documented, versioned API offering:

1. **REST endpoints** for questions, topics, and metadata
   - `GET /api/v1/questions` - List all questions with pagination
   - `GET /api/v1/questions/:slug` - Single question with full content
   - `GET /api/v1/questions/random` - Random question (for daily challenge apps)
   - `GET /api/v1/topics` - List all topic tags
   - `GET /api/v1/questions?topic=trees&difficulty=3` - Filtered queries

2. **Export formats**
   - JSON (full dataset download)
   - CSV (spreadsheet-friendly)
   - RSS/Atom feed (new questions as they're added)
   - Anki deck format (flashcard import)

3. **Developer experience**
   - OpenAPI/Swagger documentation
   - Rate limiting with generous free tier
   - API key authentication (optional, for tracking)
   - CORS enabled for browser clients
   - Webhook notifications for new questions

## Key Deliverables

- [ ] Design API schema and versioning strategy
- [ ] Implement REST endpoints in Astro (using `src/pages/api/` directory)
- [ ] Add content negotiation (JSON, XML, CSV based on Accept header)
- [ ] Create RSS/Atom feed for new questions at `/feed.xml`
- [ ] Build full dataset export endpoint with format options
- [ ] Generate OpenAPI specification and interactive documentation
- [ ] Implement optional API key system for usage tracking
- [ ] Add rate limiting middleware (generous for static data)
- [ ] Create Anki deck generator for flashcard users
- [ ] Write developer documentation with code examples
- [ ] Create "Powered by Cassidoo Archive" badge for third-party apps
- [ ] Set up CORS headers for browser-based consumers

## Prerequisites

**Content Intelligence Layer** (Initiative #1) for topic/difficulty filtering in API.

## Risks & Open Questions

- Versioning strategy: How to handle breaking changes?
- Rate limiting: What's reasonable for a static dataset?
- Attribution requirements: Should third-party apps credit the source?
- Content licensing: Need to clarify usage rights for API consumers
- Maintenance: API consumers expect stability; breaking changes are painful
- Monetization: Should there be a paid tier for commercial use?

## Notes

- Astro can serve API routes, but for complex APIs consider a separate service
- RSS feed is low-effort, high-value—many developers use RSS readers
- Anki integration could drive significant traffic from studying developers
- Reference files: `src/pages/search.json.ts` (existing lightweight endpoint)
- Consider JSON Feed format as modern RSS alternative
- GitHub API is a good model for documentation and developer experience
