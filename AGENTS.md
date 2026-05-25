# Agent Guidelines

Source of truth for any agent working in this repo (Claude, Cursor, Aider, Codex, etc.).

## Project Overview

A static web archive of interview questions from Cassidy Williams' (Cassidoo) weekly newsletter. Two parts:

1. **Scraper** (`scraper/`): pulls newsletter content from Buttondown's RSS feed and writes one markdown file per issue.
2. **Frontend** (`src/`): Astro static site that lists and renders the questions.

## Runtime & Package Manager

This project exclusively uses **Bun** (not Node.js, npm, or pnpm):

- Install dependencies: `bun install`
- Run scripts: `bun run <script>`
- Execute files: `bun <file.ts>`
- Bun loads `.env` automatically — do not import `dotenv`.

## Common Commands

```bash
bun run dev                  # Start Astro dev server
bun run build                # Build static site
bun run preview              # Preview production build
bun run check                # Astro type / content-schema check
bunx biome check . --write   # Lint + format

bun run scrape               # Fetch RSS (COUNT=1000 default), write any missing question files
COUNT=20 bun run scrape      # Weekly-delta mode (matches CI)
```

## Code Style

Biome handles formatting and linting (`biome.json`):

- Tabs for indentation, double quotes for strings.
- Imports are organised by Biome's `assist`.
- TypeScript with strict typing; prefer `interface` for object shapes.
- Prefer Bun-native APIs (`Bun.file`, `Bun.write`, `Bun.serve`) over the Node `fs` equivalents.
- Astro components: keep logic in the frontmatter (`---`) separate from the template.

## Architecture

### Scraper

Single-step pipeline driven by Buttondown's RSS feed (see [docs/adr/0001-rss-only-ingestion.md](docs/adr/0001-rss-only-ingestion.md)):

1. **`scraper/scrape.ts`**
   - Fetches `https://buttondown.com/cassidoo/rss?count=${COUNT}` (default 1000; weekly CI uses 20).
   - Parses with `feedsmith`. Each `<item>` carries a full HTML body in `<description>`.
   - Sorts items oldest-first; assigns `number = index + 1`.
   - Skips items where `src/content/questions/{date}.md` already exists.
   - Prints a summary line at the end: `processed / written / skipped (exists) / skipped (no q) / failed`.

2. **`scraper/extract.ts`** (`extractQuestion`)
   - Wraps the description HTML in a minimal HTML doc and parses with JSDOM.
   - `wrapContentBetweenHRs`: wraps content between consecutive `<hr>` tags in `.hr-section` divs.
   - Finds the `.hr-section` whose `<h2>` contains "interview".
   - Picks the longest `<strong>` (>30 chars) as the question; falls back to plain-text-after-h2 for the loose-HTML 2017 era.
   - Walks following siblings (examples, code blocks) until the "submit your answers" / "replying to this email" sentinel, bounded by the interview section.
   - Wraps the assembled fragment in a full HTML doc, runs it through `defuddle` → markdown, then `remark-unlink` to strip outbound links.
   - Returns `{ status: "ok" | "skipped" | "failed", ... }`.

### Frontend

- **Framework**: Astro 5 (static site generation).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`.
- **Content**: Astro Content Collections, loaded from `src/content/questions/*.md`.
   - Schema (`src/content.config.ts`): `{ url: string, date: Date, number: number }`.
   - Files are named by date (`YYYY-MM-DD.md`); Astro derives slugs from filenames.
- **Icons**: `astro-icon`.

### File Structure

```
scraper/
  ├── scrape.ts        # RSS fetch + driver loop
  └── extract.ts       # extractQuestion + HTML→markdown plumbing
src/
  ├── content/
  │   └── questions/   # Generated markdown (one file per newsletter)
  ├── content.config.ts
  ├── pages/
  │   ├── index.astro
  │   ├── search.json.ts
  │   └── questions/[slug].astro
  ├── layouts/Layout.astro
  └── components/QuestionsApp.astro
docs/adr/              # Architectural decisions (start at 0001)
```

## Automation

`.github/workflows/weekly-scrape.yml`:

- Runs every Monday at 03:00 UTC (and on `workflow_dispatch`).
- Steps: checkout → setup Bun → `bun install` → `COUNT=20 bun run scrape` → commit any new files in `src/content/questions/`.

## Important Implementation Details

- **Re-scraping**: `scraper/scrape.ts` skips files that already exist. To re-extract an issue, delete the corresponding `src/content/questions/{date}.md` first.
- **Numbering**: `number` is a synthetic ordinal — index of the item in the oldest-first sort across all items the feed returned. Stable for the existing backlog; the next new issue becomes `number + 1`.
- **Date format**: ISO 8601 `YYYY-MM-DD`, derived from the RSS `<pubDate>`.
- **Dependencies**:
   - `feedsmith` — RSS parser
   - `jsdom` — DOM for each item's description HTML
   - `defuddle` — HTML → Markdown
   - `remark` / `remark-unlink` — markdown post-processing

## Testing & Validation

There is no test suite. Validation = running `bun run check` (Astro content schema + TypeScript), and eyeballing the summary line printed at the end of `bun run scrape` (a non-zero "failed" count generally means an issue without an interview segment, not a parser regression — but worth verifying).
