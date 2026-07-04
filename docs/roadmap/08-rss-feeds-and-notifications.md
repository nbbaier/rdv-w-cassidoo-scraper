# RSS Feeds & Notifications

**Category:** New Feature | Integration
**Quarter:** Q2
**T-shirt Size:** S

## Why This Matters

The archive is updated weekly via GitHub Action, but users have no way to know when new questions arrive unless they manually visit the site. This is a missed retention opportunity.

Many developers actively use RSS readers (Feedly, Inoreader, NetNewsWire) and would happily subscribe if a feed existed. Others prefer email digests or push notifications.

Proactive content delivery keeps users engaged between visits. Instead of hoping users remember to check back, the content comes to them.

## Current State

- Weekly scrape adds new questions via GitHub Action
- No RSS/Atom feed exists
- No notification system
- No email digest option
- Users must manually check for updates
- The original newsletter sends questions, but the archive doesn't notify about additions

## Proposed Future State

Multiple notification channels for new questions:

1. **RSS/Atom feed** at `/feed.xml`
   - Full question content (not just excerpts)
   - Proper formatting with code blocks
   - Works with all major RSS readers
   - Separate feeds by topic (optional, post-Content Intelligence)

2. **JSON Feed** at `/feed.json`
   - Modern alternative to RSS
   - Easier to parse programmatically
   - Includes metadata (difficulty, topics)

3. **Email digest** (optional signup)
   - Weekly summary of new questions
   - Personalized recommendations based on preferences
   - Unsubscribe-friendly

4. **Browser push notifications**
   - Opt-in for real-time alerts
   - "New question about binary trees!"

5. **Social presence**
   - Auto-post new questions to dedicated social accounts
   - Cross-promote with original newsletter

## Key Deliverables

- [ ] Generate RSS/Atom feed at build time (`/feed.xml`)
- [ ] Add JSON Feed at `/feed.json` with full metadata
- [ ] Implement proper content encoding for code blocks in feed
- [ ] Create feed auto-discovery meta tags in Layout
- [ ] Build email subscription form and landing page
- [ ] Set up email service (Buttondown, Resend, or ConvertKit)
- [ ] Implement weekly digest email generation
- [ ] Add push notification support with service worker
- [ ] Create notification preferences page for logged-in users
- [ ] Add topic-specific feed endpoints (`/feed/trees.xml`, `/feed/dp.xml`)
- [ ] Set up social media automation (optional: Buffer, Zapier)
- [ ] Add "Subscribe" CTA to site header/footer

## Prerequisites

None for basic RSS; **Content Intelligence Layer** (Initiative #1) enables topic-specific feeds.

## Risks & Open Questions

- Email deliverability: Need proper SPF/DKIM setup to avoid spam folders
- Push notification fatigue: Weekly cadence is probably right; more frequent is annoying
- Privacy: Email addresses need proper handling (GDPR compliance)
- Cost: Email services have pricing tiers; need to estimate subscriber growth
- Maintenance: Social automation requires monitoring for failures
- Duplicate content: Users subscribed to both archive AND original newsletter get duplicates

## Notes

- RSS is "boring" technology but still has devoted users in the developer community
- Buttondown (which hosts the original newsletter) has APIs that could simplify email
- Consider integrating with Cassidoo's existing newsletter rather than competing
- Feed validation: test with https://validator.w3.org/feed/
- Reference files: `src/layouts/Layout.astro` (add feed discovery), `astro.config.mjs`
- Low effort, high value—this is a quick win
