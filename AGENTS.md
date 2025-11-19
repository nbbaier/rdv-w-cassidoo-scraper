# Agent Guidelines

## Commands
- **Build:** `bun run build` (runs `astro build`)
- **Dev:** `bun run dev` (runs `astro dev`)
- **Type Check:** `bun run check` (runs `astro check`)
- **Lint/Format:** `bunx biome check .` (use `--write` to fix)
- **Scrape:** `bun run scrape` (fetch emails) or `bun run generate` (create markdown)
- **Test:** `bun test` (run single test: `bun test <path>`)

## Code Style & Conventions
- **Runtime:** **STRICTLY** use **Bun** for all tasks (`bun install`, `bun run`).
- **Formatting:** Adhere to Biome config: **Tabs** for indentation, **Double Quotes** for strings.
- **TypeScript:** Use strict typing. Prefer `interface` for objects.
- **Imports:** Use standard ESM imports. Note `import ... with { type: "json" }` usage.
- **Astro:** Keep logic in Frontmatter (`---`) separate from template.
- **File Ops:** Use `Bun.file()` API instead of `fs` where possible.
- **CSS:** Tailwind CSS is configured; use utility classes.

## Copilot/Cursor Rules
- **Bun Native:** Use `Bun.serve`, `Bun.write`, `Bun.file` over Node.js APIs.
- **No Dotenv:** Bun loads `.env` automatically; do not import `dotenv`.
- **Testing:** Use `bun test` runner (Jest-compatible).
