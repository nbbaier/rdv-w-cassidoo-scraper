# Agent Guidelines

Source of truth for any agent working in this repo.

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
bun run check                # Ultracite (Biome) lint check
bun run fix                  # Ultracite (Biome) auto-fix
bun run check:astro          # Astro type / content-schema check

bun run scrape               # Fetch RSS (COUNT=1000 default), write any missing question files
COUNT=20 bun run scrape      # Smaller window — only safe if every item already exists on disk
```

## Code Style

Linting/formatting is handled by **Ultracite** (a Biome preset) — see `biome.jsonc`:

- Tabs for indentation, double quotes for strings.
- TypeScript with strict typing; prefer `interface` for object shapes.
- Prefer Bun-native APIs (`Bun.file`, `Bun.write`, `Bun.serve`) over Node `fs` equivalents.
- Astro components: keep logic in the frontmatter (`---`) separate from the template.
- Run `bun run fix` before committing.

## Architecture

### Scraper

Single-step pipeline driven by Buttondown's RSS feed (see [docs/adr/0001-rss-only-ingestion.md](docs/adr/0001-rss-only-ingestion.md)):

1. **`scraper/scrape.ts`**
   - Fetches `https://buttondown.com/cassidoo/rss?count=${COUNT}` (default 1000; weekly CI relies on this default).
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

- **Framework**: Astro 6 (static site generation).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`; global styles in `src/styles/`.
- **Content**: Astro Content Collections, loaded from `src/content/questions/*.md`.
   - Schema (`src/content.config.ts`): `{ url: string, date: Date, number: number }`.
   - Files are named by date (`YYYY-MM-DD.md`); Astro derives slugs from filenames.
- **Icons**: `astro-icon` with `@iconify-json/lucide`.

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
  ├── components/QuestionsApp.astro
  └── styles/
docs/adr/              # Architectural decisions (start at 0001)
```

## Automation

`.github/workflows/weekly-scrape.yml`:

- Runs every Monday at 03:00 UTC (and on `workflow_dispatch`).
- Steps: checkout → setup Bun → `bun install` → `bun run scrape` (uses the default `COUNT=1000`) → commit any new files in `src/content/questions/`.

## Important Implementation Details

- **Re-scraping**: `scraper/scrape.ts` skips files that already exist. To re-extract an issue, delete the corresponding `src/content/questions/{date}.md` first.
- **Numbering**: `number` is a synthetic ordinal — index of the item in the oldest-first sort across all items the feed returned. This is why CI uses the default `COUNT=1000`: if the feed window doesn't cover the entire archive, new issues are numbered relative to the window (e.g. `20`) instead of continuing the global sequence (e.g. `458`).
- **Date format**: ISO 8601 `YYYY-MM-DD`, derived from the RSS `<pubDate>`.
- **Key dependencies**:
   - `feedsmith` — RSS parser
   - `jsdom` — DOM for each item's description HTML
   - `defuddle` — HTML → Markdown
   - `remark` / `remark-unlink` — markdown post-processing

## Testing & Validation

There is no test suite. Validation = running `bun run check` (Ultracite/Biome) and `bunx astro check` (content schema + TypeScript), plus eyeballing the summary line printed at the end of `bun run scrape` (a non-zero "failed" count generally means an issue without an interview segment, not a parser regression — but worth verifying).

