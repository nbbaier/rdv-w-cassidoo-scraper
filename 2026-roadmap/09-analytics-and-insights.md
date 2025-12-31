# Analytics & Insights Dashboard

**Category:** New Feature | Documentation
**Quarter:** Q3
**T-shirt Size:** M

## Why This Matters

With 435+ questions and 8 years of history, the archive is a rich dataset waiting to be explored. But currently, there's no visibility into:

1. Which questions are most popular?
2. What topics are most searched?
3. How has interview question complexity evolved over time?
4. When do users visit (before interviews)?
5. What's the average time spent on a question page?
6. Are users actually practicing or just browsing?

Analytics serve two purposes:

1. **For administrators**: Understand usage patterns to prioritize features
2. **For users**: Explore trends ("Dynamic programming questions increased 50% in 2024!")

A public insights dashboard also becomes marketing content—"See 8 years of interview question evolution"—attracting visitors and establishing authority.

## Current State

- No analytics implementation
- No usage tracking
- No visibility into user behavior
- No public statistics page
- Historical trends are invisible (except by manually counting files)

## Proposed Future State

1. **Internal analytics** (admin-only)
   - Page views per question
   - Search queries (with Pagefind or custom)
   - Feature usage (practice mode, solutions, filters)
   - Error tracking (scraper failures, broken links)
   - Weekly active users, retention curves

2. **Public insights dashboard** (accessible to all)
   - Total questions by year (visualization)
   - Questions by topic distribution (pie chart)
   - Difficulty distribution over time
   - Most viewed questions this month
   - Search trends ("What are people looking for?")
   - "This week in interview history" (questions from this week in past years)

3. **Content recommendations** driven by analytics
   - "Trending questions" section on homepage
   - "Most solved this week" in practice mode
   - Personalized "You might like" based on history

## Key Deliverables

- [ ] Choose privacy-respecting analytics tool (Plausible, Umami, or Fathom)
- [ ] Implement basic page view tracking
- [ ] Add event tracking for key actions (search, filter, practice, solution view)
- [ ] Create admin dashboard for usage metrics
- [ ] Build public "/insights" page with visualizations
- [ ] Implement question-level statistics (views, attempts, completion rate)
- [ ] Create yearly trends visualization ("Questions by Topic Over Time")
- [ ] Add "Trending Questions" section to homepage
- [ ] Implement search analytics (anonymized popular queries)
- [ ] Build "This Week in History" feature
- [ ] Create shareable statistics embeds for social media
- [ ] Set up error tracking for scraper failures (Sentry or similar)

## Prerequisites

- **Content Intelligence Layer** (Initiative #1) for topic-based analytics
- **Interactive Practice Mode** (Initiative #5) for attempt/completion tracking
- **Full-Text Search** (Initiative #3) for search analytics

## Risks & Open Questions

- Privacy: Analytics must be privacy-respecting (no personal data, no fingerprinting)
- Cost: Self-hosted analytics (Umami) vs. paid (Plausible) trade-offs
- Accuracy: Client-side analytics miss users with blockers
- Scope creep: Analytics can become a rabbit hole—define MVP carefully
- Public data: Which metrics are appropriate to share publicly?
- Gaming: Public popularity metrics can be gamed—need safeguards

## Notes

- Plausible and Umami are GDPR-compliant by design—no cookie banners needed
- Self-hosting Umami is free but requires infrastructure
- The insights dashboard is also great content marketing ("See interview trends!")
- Reference files: `src/layouts/Layout.astro` (add tracking script)
- Consider making raw anonymized data available for researchers
