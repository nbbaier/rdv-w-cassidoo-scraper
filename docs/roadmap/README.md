# 2026 Strategic Roadmap

## Executive Summary

This roadmap transforms the Cassidoo Interview Questions Archive from a **static archive** into a **dynamic learning platform**. Over four quarters, we'll add intelligence to content, build community around solutions, enable interactive practice, and create an ecosystem that developers actively engage with—not just visit.

The archive currently holds 435+ interview questions spanning 8 years—a unique, curated dataset. But it's underutilized. Questions are flat markdown files with minimal metadata. Users read and leave. There's no stickiness, no community, no progression.

By Q4 2026, this project becomes:

- **A learning platform** with structured paths and interactive practice
- **A community hub** where developers share and discuss solutions
- **An API provider** enabling third-party apps and integrations
- **A search destination** for interview prep content

The moonshot? An AI-powered interview prep companion that knows the entire Cassidoo corpus and can tutor developers through their weakest areas.

---

## High-Level Themes

### 🧠 Theme 1: Content Intelligence (Q1)
Make the content smarter. Add difficulty ratings, topic tags, and relationships between questions. This is foundational—everything else depends on rich metadata.

### 🔍 Theme 2: Discoverability (Q1)
Users can't engage with what they can't find. Full-text search, API access, and RSS feeds make content accessible across channels.

### 🛡️ Theme 3: Reliability (Q1)
Zero tests is a liability. Build confidence through comprehensive testing before adding complexity.

### 🤝 Theme 4: Community (Q2)
Transform passive readers into active contributors. Solutions, discussions, and shared progress create network effects.

### 📚 Theme 5: Structured Learning (Q2)
Curated paths turn a question pile into a curriculum. Users achieve goals, not just browse content.

### 📊 Theme 6: Insights (Q3)
Understand usage, surface trends, and make data-driven decisions about content and features.

---

## Initiative Summary

| # | Initiative | Category | Quarter | Size | Status |
|---|------------|----------|---------|------|--------|
| 00 | [AI Interview Coach](00-moonshot.md) | Moonshot | Q4+ | XXL | 🌙 Dream |
| 01 | [Content Intelligence Layer](01-content-intelligence-layer.md) | Architecture | Q1 | L | 📋 Planned |
| 02 | [Test Suite Foundation](02-test-suite-foundation.md) | Testing | Q1 | M | 📋 Planned |
| 03 | [Full-Text Search Engine](03-full-text-search-engine.md) | Performance | Q1 | M | 📋 Planned |
| 04 | [Public API & Exports](04-public-api-and-exports.md) | Integration | Q1 | M | 📋 Planned |
| 05 | [Interactive Practice Mode](05-interactive-practice-mode.md) | New Feature | Q2 | XL | 📋 Planned |
| 06 | [Community Solutions Gallery](06-community-solutions-gallery.md) | New Feature | Q2 | L | 📋 Planned |
| 07 | [Learning Paths & Tracks](07-learning-paths-and-tracks.md) | New Feature | Q2 | L | 📋 Planned |
| 08 | [RSS Feeds & Notifications](08-rss-feeds-and-notifications.md) | Integration | Q2 | S | 📋 Planned |
| 09 | [Analytics & Insights](09-analytics-and-insights.md) | New Feature | Q3 | M | 📋 Planned |
| 10 | [Solution Aggregator](10-solution-aggregator.md) | Integration | Q3 | L | 📋 Planned |

---

## Dependency Graph

```
Q1 Foundation
==============
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌──────────────────────────────────┐                      │
│ 01 Content Intelligence Layer    │◄─────────────────────┤
│    (topics, difficulty, tags)    │                      │
└───────────────┬──────────────────┘                      │
                │                                         │
                │ enables                                 │
                ▼                                         │
┌──────────────────────────────────┐                      │
│ 03 Full-Text Search              │                      │
│    (faceted by topic/difficulty) │                      │
└──────────────────────────────────┘                      │
                                                          │
┌──────────────────────────────────┐                      │
│ 02 Test Suite Foundation         │──────────────────────┤
│    (parallel, no dependencies)   │                      │
└──────────────────────────────────┘                      │
                                                          │
┌──────────────────────────────────┐                      │
│ 04 Public API & Exports          │──────────────────────┘
│    (requires 01 for filtering)   │
└───────────────┬──────────────────┘
                │
                │ enables
                ▼
Q2 Community & Learning
=======================
┌──────────────────────────────────┐
│ 05 Interactive Practice Mode     │◄──── requires 01, 02, 04
│    (code editor, test cases)     │
└───────────────┬──────────────────┘
                │
                │ enables
                ▼
┌──────────────────────────────────┐
│ 06 Community Solutions Gallery   │◄──── requires 04
│    (submissions, voting)         │
└───────────────┬──────────────────┘
                │
                │ enables
                ▼
┌──────────────────────────────────┐
│ 07 Learning Paths & Tracks       │◄──── requires 01
│    (curated progressions)        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 08 RSS Feeds & Notifications     │
│    (standalone, quick win)       │
└──────────────────────────────────┘

Q3 Insights & Integration
=========================
┌──────────────────────────────────┐
│ 09 Analytics & Insights          │◄──── requires 01, 03, 05
│    (usage, trends, public stats) │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 10 Solution Aggregator           │◄──── requires 06, 04, 01
│    (social discovery)            │
└──────────────────────────────────┘

Q4 Moonshot
===========
┌──────────────────────────────────┐
│ 00 AI Interview Coach            │◄──── requires ALL previous
│    (tutoring, personalization)   │
└──────────────────────────────────┘
```

---

## Quarterly Overview

### Q1: Foundation Quarter
Build the infrastructure that enables everything else.

- **01 Content Intelligence**: Enrich all 435 questions with metadata
- **02 Test Suite**: Establish testing discipline before complexity grows
- **03 Full-Text Search**: Replace naive filtering with proper search
- **04 Public API**: Enable third-party integrations

**Exit criteria**: Every question has difficulty/topics. Tests exist. Search works. API is documented.

### Q2: Engagement Quarter
Transform from passive archive to active practice platform.

- **05 Interactive Practice**: Code in the browser, run tests
- **06 Solutions Gallery**: Community submissions and voting
- **07 Learning Paths**: Curated question progressions
- **08 RSS & Notifications**: Proactive content delivery

**Exit criteria**: Users can practice, share solutions, follow tracks, and subscribe.

### Q3: Intelligence Quarter
Understand usage and surface distributed content.

- **09 Analytics**: Know what's working, what's popular, what's missing
- **10 Solution Aggregator**: Discover solutions from across the web

**Exit criteria**: Dashboard shows trends. Social solutions are indexed.

### Q4: Moonshot Quarter
Push boundaries with AI-powered personalization.

- **00 AI Interview Coach**: Personalized tutoring, adaptive recommendations

**Exit criteria**: AI can explain, hint, and guide learners through questions.

---

## Resource Assumptions

This roadmap assumes unlimited engineering resources and budget. In reality, prioritization would be:

1. **Must-have (Q1)**: 01, 02, 03 (foundation without which others fail)
2. **High-value (Q2)**: 05, 08 (practice mode is transformative; RSS is quick win)
3. **Community-driven (Q2-Q3)**: 06, 07 (require moderation investment)
4. **Nice-to-have (Q3+)**: 04, 09, 10 (valuable but not essential)
5. **Aspirational**: 00 (moonshot by definition)

---

## Success Metrics

By end of 2026:

| Metric | Current | Target |
|--------|---------|--------|
| Questions in archive | 435 | 500+ |
| Questions with full metadata | 0 | 500+ |
| Test coverage | 0% | 80%+ |
| Monthly active users | ? | 10,000+ |
| Practice sessions/month | 0 | 5,000+ |
| Community solutions | 0 | 1,000+ |
| API consumers | 0 | 50+ |
| RSS subscribers | 0 | 1,000+ |

---

## Getting Started

1. Read initiative files in order (01 → 10, then 00)
2. Begin with Content Intelligence and Test Suite in parallel
3. Track progress by updating initiative files with completion status
4. Review and adjust quarterly based on learnings

---

*This roadmap was created to envision what this project could become with unlimited resources and ambition. Reality may require prioritization, but the vision remains the north star.*
