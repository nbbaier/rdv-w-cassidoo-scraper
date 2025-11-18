# Plan: Astro Frontend for Cassidoo Scraper

## Goal

Build a static frontend using Astro to browse interview questions, hosted on Cloudflare Pages. The site will be updated weekly via a GitHub Action that runs the scraper and commits the new questions to the repository.

## 1. Project Restructuring

- [x] **Move Scraper Code**: Create a `scraper/` directory and move `src/scrape.ts`, `src/index.ts` (generator), and `src/utils.ts` there.
- [x] **Update Dependencies**:
   - Change `linkedom` dependency in `package.json` from `link:linkedom` to a standard version (e.g., `^0.18.0`) to ensure CI compatibility.
- [x] **Update Scripts**: Update `package.json` scripts to point to the new `scraper/` paths.

## 2. Astro Setup

- [x] **Install Astro**: Initialize Astro in the root (or manually add dependencies if preferred to keep it minimal).
   - Dependencies: `astro`, `@astrojs/check`, `typescript`, `tailwindcss`, `@tailwindcss/vite`.
- [x] **Configuration**:
   - Create `astro.config.mjs` with Tailwind v4 Vite plugin.
   - Update `tsconfig.json` to include Astro types.
- [x] **Folder Structure**:
   - `src/content/questions/`: Destination for markdown files.
   - `src/pages/`: Astro pages.
   - `src/layouts/`: Astro layouts.

## 3. Content Collections

- [x] **Define Schema**: Create `src/content/config.ts` to define the `questions` collection.
   - Fields: `url` (string), `date` (date), `number` (number).
- [x] **Migrate Data**: Move any existing markdown files from `data/questions` to `src/content/questions`.

## 4. Scraper Updates

- [x] **Update Output Path**: Modify `scraper/utils.ts` (specifically `getQuestion`) to write markdown files to `src/content/questions/`.
- [x] **Update Intermediate Data**: Ensure `data.json` and `data/html` are stored in `scraper/data/` and add them to `.gitignore` (or keep `data.json` in root if preferred, but organized is better).

## 5. Frontend Implementation

- [x] **Layout**: Create a basic `Layout.astro` with a header/footer.
- [x] **Search API**: Create `src/pages/search.json.ts` to generate a lightweight JSON index of all questions (slug, date, number, excerpt) at build time.
- [x] **Index Page (`/`)**:
   - Fetch the `search.json` client-side.
   - Render a list of all questions.
   - Implement a text input to filter the list by date, number, or text content.
- [x] **Question Page (`/questions/[slug]`)**:
   - Use `getCollection` to generate static paths for all questions.
   - Render the markdown content using Astro's `<Content />` component.

## 6. CI/CD (GitHub Actions & Cloudflare)

- [ ] **GitHub Action**: Create `.github/workflows/weekly-scrape.yml`.
   - **Schedule**: Weekly (e.g., Monday 3am UTC).
   - **Steps**:
      - Checkout repo.
      - Setup Bun.
      - Run Scrape & Generate.
      - Commit and push changes if any (`[skip ci]` in commit message to avoid redundant checks, though CF Pages uses its own trigger).
- [ ] **Cloudflare Pages**:
   - Connect the repository.
   - Build command: `npm run build` (or `bun run build`).
   - Output directory: `dist/`.
