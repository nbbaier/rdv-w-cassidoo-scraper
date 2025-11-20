# Project Scout Report: Cassidoo Interview Questions Archive

**Last Updated:** November 20, 2025

## Quick Overview
This is a **static web archive** that scrapes, processes, and displays interview questions from Cassidy Williams' weekly newsletter. The project has two main components: a **scraper** that fetches content from Buttondown archives, and an **Astro frontend** that presents the questions in a searchable, paginated interface.

## Architecture Flow
```
Buttondown Archives → Scraper → Markdown Files → Astro Site
```

### 1. Scraper Pipeline (`scraper/`)
- **`scrape.ts`**: Crawls archive pages (1-9), extracts newsletter metadata (URL, date, issue #) → saves to `scraper/data/data.json`
- **`index.ts`**: Processes each newsletter: fetches HTML, isolates "Interview Question" section, converts to Markdown → saves to `src/content/questions/`
- **`utils.ts`**: Core parsing logic using `<hr>` tags to find question boundaries, HTML→Markdown conversion with `defuddle`

### 2. Frontend (`src/`)
- **Framework**: Astro v5 with static generation
- **Content**: Uses Astro's Content Collections API (`src/content/questions/*.md`)
- **UI**: `QuestionsApp.astro` component with client-side search, year filtering, and pagination
- **Styling**: Tailwind CSS v4 with custom components
- **Search**: JSON-based search index (`/search.json`) for fast filtering

## Key Commands (Use Bun Only)
```bash
bun install          # Install dependencies
bun run scrape       # Fetch latest newsletter list
bun run generate     # Process new emails → markdown
bun run dev          # Start development server
bun run build        # Build static site
bunx biome check .   # Lint/format (add --write to fix)
```

## Automation
- **GitHub Action**: `weekly-scrape.yml` runs every Monday at 3 AM UTC
- Automatically scrapes new content and commits changes
- Manual trigger available via workflow_dispatch

## Content Structure
Each question file (`YYYY-MM-DD.md`) contains:
```markdown
---
url: [newsletter URL]
date: YYYY-MM-DD
number: [issue number]
---

[Interview question content]
```

## First Tasks When Resuming
1. **Check for new content**: Run `bun run scrape && bun run generate`
2. **Test the pipeline**: Verify a few new questions were processed correctly
3. **Review scraper robustness**: Check if Buttondown HTML structure changed
4. **Update hardcoded pagination**: Consider increasing page range in `scraper/scrape.ts`
5. **Run quality checks**: `bunx biome check .` and `bun run check`

## Known Fragility Points
- **HTML parsing**: Relies on specific Buttondown structure (`.email`, `.email-metadata` classes)
- **Content extraction**: Uses `<hr>` tag heuristics to isolate interview questions
- **Fixed pagination**: Only checks pages 1-9 of archives
- **Date parsing**: Assumes consistent date format in newsletter metadata

## Quick Debugging Tips
- Check `scraper/data/data.json` for scraped newsletter metadata
- Review `scraper/data/html/` for raw HTML files if parsing fails
- Test individual question generation by temporarily modifying `scraper/index.ts`
- Use browser dev tools to inspect search index at `/search.json`