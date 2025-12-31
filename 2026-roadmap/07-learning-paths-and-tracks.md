# Learning Paths & Tracks

**Category:** New Feature
**Quarter:** Q2
**T-shirt Size:** L

## Why This Matters

With 435+ questions spanning 8 years, users face paradox of choice. Where should a beginner start? How does someone weak on trees level up? What should you practice the week before a Google interview?

A flat, chronological list (current state) doesn't support intentional learning. Learning paths transform the archive from a haystack into a curriculum—guiding users through questions in a pedagogically sound order.

This is the difference between "here are 400 problems" and "here's a 12-week program to master data structures." Structured learning is how people actually improve.

## Current State

- Questions displayed in reverse chronological order
- Filtering by year is the only organization
- No progression from easy to hard
- No grouping by related concepts
- No recommended learning order
- Users don't know what they don't know

## Proposed Future State

The archive offers curated learning tracks:

1. **Skill-based tracks**
   - "Arrays & Strings Fundamentals" (20 questions, beginner-friendly)
   - "Mastering Binary Trees" (15 questions, progressive difficulty)
   - "Dynamic Programming Journey" (25 questions, with prerequisites)
   - "Graph Algorithms Deep Dive" (18 questions, intermediate-advanced)

2. **Goal-based paths**
   - "FAANG Interview Prep" (50 questions, high-signal problems)
   - "2-Week Crash Course" (14 questions, one per day)
   - "Weekend Warrior" (10 questions, solvable in a weekend)

3. **Progress tracking**
   - Visual progress bars
   - Completion certificates
   - "Next recommended question" suggestions

4. **Adaptive recommendations**
   - "You're strong on arrays, try graphs next"
   - "You struggled with recursion, here's more practice"

Each track page shows:
- Overview and learning objectives
- Prerequisites
- Estimated time commitment
- Question list with completion checkboxes
- Progress percentage

## Key Deliverables

- [ ] Design track data model (questions, order, prerequisites, estimated time)
- [ ] Create track curation interface for administrators
- [ ] Build 5-8 initial tracks covering major topics and goals
- [ ] Implement track progress tracking (local storage + optional auth)
- [ ] Design track landing page with overview and question list
- [ ] Add "Start Track" and "Continue Track" CTAs
- [ ] Create visual progress indicators (checkmarks, progress bars)
- [ ] Implement "Next Question" recommendations within tracks
- [ ] Build completion certificates (shareable images/PDFs)
- [ ] Add track filtering to main navigation
- [ ] Create "Suggested Track" recommendations based on history
- [ ] Implement prerequisite enforcement (can't start advanced before completing intro)
- [ ] Add track comparison view ("Which track is right for me?")

## Prerequisites

- **Content Intelligence Layer** (Initiative #1) for difficulty/topic metadata
- **Test Suite** (Initiative #2) for validation of track configurations

## Risks & Open Questions

- Curation effort: Who creates and maintains tracks? (AI-assisted + human review)
- Subjectivity: "Best path to learn X" is inherently opinionated
- Staleness: Tracks need updates as new questions are added
- User expectations: Tracks imply a promise of learning outcomes—can we deliver?
- Progress persistence: Local storage is fragile; need account sync option
- Track proliferation: Too many tracks creates new paradox of choice

## Notes

- freeCodeCamp's curriculum model is a good reference for track structure
- Start with 5 tracks and expand based on user feedback
- AI can suggest question ordering based on complexity and dependencies
- Consider "community-curated tracks" later, but start with editorial control
- Reference files: `src/content/config.ts` (needs track collection)
- Completion certificates are shareable—good for social proof and marketing
