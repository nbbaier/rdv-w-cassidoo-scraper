# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static web archive of interview questions from Cassidy Williams' (Cassidoo) weekly newsletter. The project consists of two main parts:

1. **Scraper** (`scraper/`): Fetches and parses newsletter content from Buttondown
2. **Frontend** (`src/`): Astro-based static site displaying the questions

## Runtime & Package Manager

This project exclusively uses **Bun** (not Node.js, npm, or pnpm):

- Run scripts: `bun run <script>`
- Install dependencies: `bun install`
- Execute files: `bun <file.ts>`

## Common Commands

### Development

```bash
bun run dev          # Start Astro dev server
bun run build        # Build static site
bun run preview      # Preview production build
bun run check        # Run Astro type checking
```

### Scraping

```bash
bun run scrape              # Fetch RSS (count=20 by default), write markdown for any new issues
COUNT=1000 bun run scrape   # One-time backfill across the full archive
```

## Code Style

Formatting and linting use **Biome** (not Prettier/ESLint):

- Indentation: tabs (not spaces)
- Quote style: double quotes
- Import organization: automatic via Biome assist

## Architecture

### Scraper Workflow

Single-step pipeline driven by the Buttondown RSS feed (see [docs/adr/0001-rss-only-ingestion.md](docs/adr/0001-rss-only-ingestion.md)):

1. **`scraper/scrape.ts`**:
   - Fetches `https://buttondown.com/cassidoo/rss?count=${COUNT}` (default 1000, weekly CI uses 20).
   - Parses with `feedsmith`. Each `<item>` carries a full HTML body in `<description>`.
   - Sorts items oldest-first, assigns `number = index + 1`.
   - For each item, skips if `src/content/questions/{date}.md` already exists.
   - Logs a summary line at the end: processed / written / skipped (exists) / skipped (no q) / failed.

2. **`scraper/extract.ts`** (`extractQuestion`):
   - Wraps the description HTML in a minimal HTML doc and parses with JSDOM.
   - `wrapContentBetweenHRs`: wraps content between consecutive `<hr>` tags in `.hr-section` divs.
   - Finds the `.hr-section` whose `<h2>` contains "interview".
   - Picks the longest `<strong>` (>30 chars) as the question; falls back to plain-text-after-h2 for ~2017-era issues.
   - Walks following siblings (examples, code blocks) until "submit your answers" / "replying to this email".
   - Wraps the assembled fragment in a full HTML doc, runs through `defuddle` → markdown, then `remark-unlink` to strip links.
   - Returns `{ status: "ok" | "skipped" | "failed", ... }`.

### Frontend Architecture

- **Framework**: Astro 5 (static site generation)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Content**: Astro Content Collections (`src/content/questions/`)
   - Schema: `{ url: string, date: Date, number: number }`
   - Files: markdown with frontmatter (`YYYY-MM-DD.md`)
- **Icons**: `astro-icon` package

### File Structure

```
scraper/
  ├── scrape.ts        # RSS fetch + driver loop
  └── extract.ts       # extractQuestion + HTML→markdown plumbing
src/
  ├── content/
  │   ├── config.ts    # Content collection schema
  │   └── questions/   # Markdown files (one per newsletter)
  ├── pages/
  │   ├── index.astro  # Main listing page
  │   └── questions/[slug].astro  # Individual question page
  ├── layouts/
  │   └── Layout.astro # Base layout
  └── components/
      └── QuestionsApp.astro  # Question list UI
```

## GitHub Actions

**Weekly Scrape** (`.github/workflows/weekly-scrape.yml`):

- Runs: Every Monday at 3:00 AM UTC (or manual trigger)
- Process: scrape → generate → commit new markdown files
- Only commits if new questions found

## Important Implementation Details

### Scraper Behavior

- `scraper/scrape.ts` skips files that already exist (checks `Bun.file().exists()`)
- To re-scrape existing dates, delete the corresponding markdown file
- Date format: ISO 8601 date string (`YYYY-MM-DD`) derived from RSS `<pubDate>`

### Content Collection

- Frontmatter `date` must be parseable as `Date` by Zod schema
- Files named by date, but slug can be anything (Astro derives from filename)
- Newsletter numbers are non-sequential due to archive gaps

### Dependencies

- `feedsmith`: RSS parser
- `jsdom`: DOM for parsing each item's description HTML
- `defuddle`: HTML-to-Markdown converter
- `remark`/`remark-unlink`: Markdown processing pipeline

## Testing & Validation

Run `bun run check` to validate Astro content schema and TypeScript types before building.
