# Interactive Practice Mode

**Category:** New Feature
**Quarter:** Q2
**T-shirt Size:** XL

## Why This Matters

Currently, the archive is passive—users read questions and think "I should solve this," but the friction to actually practice is high. They need to:

1. Open their local IDE
2. Create a new file
3. Write boilerplate
4. Test manually
5. Remember to come back and check their solution

This is where most users drop off. The moment of inspiration ("this looks interesting!") doesn't translate to action.

An interactive practice mode embedded directly in the browser transforms the archive from a reading list into a **practice environment**. Users can:

- Start solving immediately (no context switching)
- Run code against test cases
- Get instant feedback
- Save progress across sessions
- Compare their solution to others

This is the difference between a blog post about interview questions and LeetCode. The practice mode is what creates stickiness and real learning.

## Current State

- Question pages (`src/pages/questions/[slug].astro`) display static markdown
- No code execution capability
- No test cases or expected outputs
- Users must copy/paste to external environments
- No way to track personal progress or save solutions
- Link to original newsletter is the only call-to-action

## Proposed Future State

Every question page includes an interactive code editor with:

1. **Monaco Editor** (VS Code's editor) embedded in the browser
2. **Language selection** (JavaScript, Python, TypeScript, Go)
3. **Test case runner** with expected input/output
4. **Instant feedback** showing pass/fail for each test
5. **Solution storage** (local storage or authenticated accounts)
6. **Hints system** with progressive reveals
7. **Community solutions** tab showing approaches from other users
8. **Time tracking** to measure solve time against estimates
9. **Streak tracking** for gamification ("7-day streak!")

The practice experience should feel as polished as LeetCode or CodeSignal, but specifically for Cassidoo's curated questions.

## Key Deliverables

- [ ] Integrate Monaco Editor component for in-browser code editing
- [ ] Set up code execution sandbox (Pyodide for Python, QuickJS for JS)
- [ ] Create test case schema and add test cases to content (as part of metadata)
- [ ] Build test runner UI with pass/fail visualization
- [ ] Implement local storage for saving work-in-progress solutions
- [ ] Add language switcher with syntax highlighting
- [ ] Design hints system with tiered reveals (gentle hint → approach hint → solution)
- [ ] Create solution submission flow (tied to accounts or anonymous)
- [ ] Build "View Solutions" gallery for each question
- [ ] Add keyboard shortcuts for common actions (run, reset, next question)
- [ ] Implement streak tracking with local/cloud persistence
- [ ] Create "Practice Mode" entry point with random question selection
- [ ] Add timer/stopwatch for timed practice
- [ ] Mobile-responsive editor experience (or clear messaging about desktop-preferred)

## Prerequisites

- **Content Intelligence Layer** (Initiative #1) for difficulty ratings and estimated solve times
- **Test Suite Foundation** (Initiative #2) to ensure robust test case validation
- **Public API** (Initiative #4) for solutions gallery backend

## Risks & Open Questions

- Code execution security: Sandboxing is critical to prevent malicious code
- Test case authoring: Who creates test cases for 435+ questions? (AI + manual review)
- Mobile experience: Monaco is desktop-focused; alternatives for mobile?
- Language parity: Some questions are language-agnostic; supporting all languages is hard
- Solution quality: Community solutions need moderation/voting to surface good examples
- Performance: Monaco is heavy (~2MB); lazy loading essential
- Accessibility: Code editors are challenging for screen readers

## Notes

- Pyodide runs Python in WebAssembly—no backend needed
- QuickJS runs JavaScript in WebAssembly as well
- Monaco Editor is used by VS Code, Codepen, and many code playgrounds
- Consider starting with JavaScript/Python only, then expanding
- LeetCode's approach: test cases are hidden but a few examples are shown
- Reference files: `src/pages/questions/[slug].astro` (question detail page)
- Alternative editors: CodeMirror (lighter), Ace Editor (also mature)
