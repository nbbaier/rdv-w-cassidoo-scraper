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
bun run scrape       # Crawl Buttondown archive, update scraper/data/data.json
bun run generate     # Generate markdown files from scraped data
```

## Code Style

Formatting and linting use **Biome** (not Prettier/ESLint):
- Indentation: tabs (not spaces)
- Quote style: double quotes
- Import organization: automatic via Biome assist

## Architecture

### Scraper Workflow

1. **Discovery** (`scraper/scrape.ts`):
   - Crawls Buttondown archive pages (currently pages 1-9)
   - Uses `linkedom` to parse HTML
   - Extracts metadata (URL, date, issue number) into `scraper/data/data.json`

2. **Extraction** (`scraper/index.ts` + `scraper/utils.ts`):
   - Reads `data.json` and fetches full newsletter HTML via `JSDOM.fromURL()`
   - Identifies "Interview Question" section using `wrapContentBetweenHRs()` (wraps content between `<hr>` tags)
   - Converts HTML to Markdown using `defuddle`
   - Removes links with `remark-unlink`
   - Writes markdown files to `src/content/questions/` with frontmatter (url, date, number)

3. **Key Parsing Logic**:
   - `wrapContentBetweenHRs()`: Wraps content between consecutive `<hr>` tags in `.hr-section` divs
   - Questions identified by finding `.hr-section` containing `<h2>` with "interview" in text
   - HTML files temporarily saved to `scraper/data/html/` for debugging

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
  ├── scrape.ts        # Archive crawler
  ├── index.ts         # Markdown generator
  ├── utils.ts         # Parsing utilities (wrapContentBetweenHRs, getQuestion)
  └── data/
      ├── data.json    # Newsletter metadata
      └── html/        # Temporary HTML cache
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
- `scraper/index.ts` skips files that already exist (checks `Bun.file().exists()`)
- To re-scrape existing dates, delete the corresponding markdown file
- Date format: ISO 8601 date string (`YYYY-MM-DD`) from `formatDate()` utility

### Content Collection
- Frontmatter `date` must be parseable as `Date` by Zod schema
- Files named by date, but slug can be anything (Astro derives from filename)
- Newsletter numbers are non-sequential due to archive gaps

### Dependencies
- `linkedom`: Lightweight DOM for initial archive parsing
- `jsdom`: Full DOM for newsletter content fetching
- `defuddle`: HTML-to-Markdown converter
- `remark`/`remark-unlink`: Markdown processing pipeline

## Testing & Validation

Run `bun run check` to validate Astro content schema and TypeScript types before building.
