# Cassidoo's Interview Questions Archive

A static, searchable web archive of the interview questions from Cassidy Williams' (Cassidoo) [weekly newsletter](https://buttondown.com/cassidoo/). Backlog and weekly updates are pulled from the newsletter's RSS feed and rendered as an Astro static site.

## How it works

- **Scraper (`scraper/`)** — fetches `https://buttondown.com/cassidoo/rss?count=N` in a single request, extracts the "Interview question of the week" segment from each item's HTML body, and writes one markdown file per issue to `src/content/questions/`. A GitHub Action (`.github/workflows/weekly-scrape.yml`) runs this every Monday to pick up the latest issue. See [docs/adr/0001-rss-only-ingestion.md](docs/adr/0001-rss-only-ingestion.md) for the design rationale.
- **Frontend (`src/`)** — Astro 5 static site with Tailwind CSS v4, loading questions via Astro Content Collections and offering client-side search/filter.

## Quick start

Requires [Bun](https://bun.com/).

```bash
bun install
bun run scrape    # populate src/content/questions/ from the RSS feed
bun run dev       # local dev server
bun run build     # build static site into dist/
```

## Contributing & agent guidance

Conventions, command reference, and architecture details live in [AGENTS.md](./AGENTS.md).
