# frontend/

React + TypeScript + Vite + Tailwind CSS single-page application. See
[../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) §2 and [../docs/DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md).

## Requirements

Node.js ≥ 22.22 (required by React Router 8). The production host does **not** need Node — the site is built locally.

## Commands

| Command           | What it does                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `npm install`     | Install dependencies                                                                                     |
| `npm run dev`     | Dev server on http://localhost:5173 (`/api` proxied to Django on :8000)                                  |
| `npm run build`   | Type-check, then production build to `dist/`                                                             |
| `npm run preview` | Serve the production build locally                                                                       |
| `npm run check`   | Type-check + ESLint + Prettier check + tests (run before every commit)                                   |
| `npm run format`  | Format all files with Prettier                                                                           |
| `npm run qa`      | Browser QA of every page in Edge (`-- --browser chrome`, `-- --release`); needs the site and API running |
| `npm run qa:perf` | LCP and initial-JS budgets on the production build (`npm run preview` first)                             |

QA details, results and the release gate: [../docs/QA_REPORT.md](../docs/QA_REPORT.md).

## Structure

```
src/
├── app/          router (lazy chunks + data loaders), root layout, error boundary, useSiteContent
├── components/
│   ├── layout/   Navbar (accessible mobile menu), Footer, SkipLink, PageHeader
│   └── ui/       ButtonLink, button-styles, Seo, SectionLabel
├── content/      static navigation config (site content comes from the API)
├── features/     contact/ — inquiry form, Zod schema, API calls, tests
├── test/         Vitest setup
├── pages/        one component per route
├── types/        content types mirroring the planned API
├── lib/          small utilities
└── styles/       Tailwind entry + design tokens (@theme)
```

## Conventions

- Colors come only from the design tokens in `src/styles/index.css`; Tailwind's default palette is disabled.
  Token classes: `bg-canvas`, `bg-surface`, `bg-raised`, `text-fg`, `text-fg-secondary`, `text-muted`,
  `text-primary-text`, `text-accent-text`, `border-line`, `border-line-strong`, `border-subtle`, …
- `bg-primary` is a fill only; never use it (or `subtle`/`accent`) for text.
- Page metadata via `<Seo title description />` (React 19 hoists it into `<head>`).
- Placeholders that need owner content are marked `TODO(content)` and must be gone before launch.
