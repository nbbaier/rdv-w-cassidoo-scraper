# Solution Aggregator

**Category:** Integration | New Feature
**Quarter:** Q3
**T-shirt Size:** L

## Why This Matters

When Cassidoo publishes a question, developers share solutions across multiple platforms—Twitter/X, Bluesky, LinkedIn, Mastodon, GitHub Gists, personal blogs. These solutions are incredibly valuable but effectively invisible. They exist for a brief moment in social feeds, then disappear into the algorithmic void.

The Solution Aggregator automatically discovers and links to these distributed solutions, surfacing the community's collective wisdom without requiring manual submission. It transforms scattered social posts into a curated knowledge base.

This is powerful for several reasons:

1. **No friction**: Authors don't need to submit—their existing shares are discovered
2. **Attribution**: Original authors get credit and traffic
3. **Diversity**: Surfaces solutions from many languages and approaches
4. **Historical value**: Rescues solutions that would otherwise be lost

## Current State

- Newsletter mentions solvers by name but doesn't link to solutions
- Solutions exist on Twitter, Bluesky, LinkedIn, Mastodon, GitHub, blogs
- No automated discovery
- Users manually search social media to find solutions
- Historical solutions are effectively lost

## Proposed Future State

Automated system that:

1. **Monitors social platforms** for Cassidoo question mentions
   - Searches for newsletter URL shares
   - Tracks #cassidoo hashtag
   - Monitors specific authors who regularly solve

2. **Discovers GitHub repositories** with solutions
   - Searches for repos named "cassidoo-*" or "interview-questions"
   - Indexes gists tagged with question dates
   - Monitors forks of known solution repos

3. **Scrapes blog posts** mentioning questions
   - Follows backlinks to newsletter
   - Monitors dev.to, Hashnode, Medium for tagged posts

4. **Creates linked gallery** per question
   - Auto-categorizes by language
   - Extracts code snippets when possible
   - Shows author, platform, and date
   - Links to original (doesn't copy content)

5. **Respects authors**
   - Opt-out mechanism for authors who don't want indexing
   - Proper attribution with links back
   - No content duplication—always link to source

## Key Deliverables

- [ ] Design aggregation architecture (scheduled jobs vs. real-time)
- [ ] Implement Twitter/X API integration for solution discovery
- [ ] Add Bluesky API integration (AT Protocol)
- [ ] Implement GitHub search API integration
- [ ] Build blog discovery via backlink monitoring
- [ ] Create solution matching algorithm (map social posts to specific questions)
- [ ] Implement language detection for categorization
- [ ] Build admin review queue for aggregated solutions
- [ ] Design opt-out mechanism for authors
- [ ] Create "Aggregated Solutions" section on question pages
- [ ] Implement deduplication for cross-posted solutions
- [ ] Add quality scoring (verified accounts, code included, etc.)
- [ ] Set up rate limiting and API quota management
- [ ] Create backfill process for historical solutions (2017-present)

## Prerequisites

- **Community Solutions Gallery** (Initiative #6) for displaying aggregated solutions
- **Public API** (Initiative #4) for solution data endpoints
- **Content Intelligence Layer** (Initiative #1) for matching solutions to questions

## Risks & Open Questions

- API access: Twitter API is expensive; Bluesky is open; others vary
- Rate limits: Monitoring at scale requires careful API management
- Accuracy: Matching social posts to specific questions is non-trivial
- Legal: Linking is generally fine, but need to be careful about scraping terms
- Spam: Automated systems can surface spam; need quality filtering
- Author consent: Some may not want their solutions aggregated—respect opt-outs
- Maintenance: API changes break integrations; need ongoing attention

## Notes

- Start with Bluesky (open API) and GitHub (generous limits)
- Twitter/X API is expensive; may need to skip or use limited endpoints
- Consider using a service like Apify for web scraping
- Cassidoo has significant Bluesky presence—start there
- Reference files: `scraper/` architecture could inspire aggregator design
- The shoutouts in newsletters mention solver names—could bootstrap discovery
