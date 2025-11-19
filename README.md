# Cassidoo's Interview Questions Scraper

A static web archive of interview questions scraped from Cassidy Williams' (Cassidoo) weekly newsletter. This project automates the process of fetching, parsing, and presenting these coding challenges in a clean, searchable interface.

## Overview

This codebase consists of two main parts: a **Scraper** and a **Frontend**.

### Architecture & Workflow

1.  **Scraper (`scraper/`)**
    *   **Discovery**: Crawls the [Buttondown archive](https://buttondown.com/cassidoo/archive/) pages to identify past newsletters, extracting metadata (date, issue number) into `scraper/data/data.json`.
    *   **Extraction**: Iterates through discovered newsletters, fetches full HTML, isolates the "Interview Question" section (using heuristic parsing), converts it to Markdown, and saves it to `src/content/questions/`.
    *   **Automation**: A GitHub Action (`weekly-scrape.yml`) runs this process weekly to keep content fresh.

2.  **Frontend (`src/`)**
    *   **Framework**: Built with **Astro**, generating a static site.
    *   **Content**: Uses Astro's Content Collections (`src/content/questions/*.md`) to manage the interview questions.
    *   **UI**: A clean interface to list and filter questions by year.
    *   **Styling**: Uses **Tailwind CSS**.

### Key Technologies

*   **Runtime**: **Bun** (used exclusively for dependencies, scripts, and dev server).
*   **Language**: TypeScript.
*   **Linting/Formatting**: Biome.
*   **Tools**: `linkedom` / `jsdom` (parsing), `defuddle` (HTML-to-Markdown).

## Getting Started

To install dependencies:

```bash
bun install
```

To run the scraper (crawl archives):

```bash
bun run scrape
```

To generate markdown content from scraped data:

```bash
bun run generate
```

To start the development server:

```bash
bun run dev
```
