# Project Plan & Roadmap

Status legend: ✅ done · 🟡 awaiting approval · ⏳ not started · ⛔ blocked

| # | Milestone | Status | Blocked by |
|---|---|---|---|
| 1 | Project Audit & Planning | ✅ Approved 2026-11-23 (hosting + BackgroundBridge Q&A still open) | — |
| 2 | Design System | ✅ Approved 2026-11-23 | — |
| 3 | Frontend Foundation | ✅ Approved 2026-11-23 | — |
| 4 | Public Website | ✅ Approved 2026-11-23 (placeholders until owner content arrives) | — |
| 5 | Django Backend | 🔨 In progress | Host Python version (final pin) |
| 6 | Contact System | ⏳ | M5; SMTP details |
| 7 | Admin & Content Management | ⏳ | M5 |
| 8 | SEO & Analytics | ⏳ | Domain name; consent approach |
| 9 | Quality Assurance | ⏳ | M4–M8 |
| 10 | Deployment | ⏳ | Hosting details; explicit deploy approval |

Each milestone ends with: verification → doc updates → report → **approval gate** → Git checkpoint commit (with approval).

---

## Milestone 1 — Project Audit & Planning ✅

Deliverables
- [x] Workspace inspected (found 3 empty directories named `.gitignore`, `CLAUDE.md`, `README.md`; removed with user permission)
- [x] `CLAUDE.md`, `README.md`, `.gitignore`, `.env.example`
- [x] `docs/` — MASTER_PROMPT, PLAN, ARCHITECTURE, CONTENT_CHECKLIST, DEPLOYMENT, DECISIONS
- [x] `frontend/` and `backend/` placeholder directories (README only, no code)
- [x] Stack validation, risks, content checklist
- [x] BackgroundBridge source inspected (read-only, 2026-11-23) → [BACKGROUNDBRIDGE_AUDIT.md](BACKGROUNDBRIDGE_AUDIT.md); owner questions open (§8)
- [ ] Hosting details received — **needs answers to DEPLOYMENT.md questionnaire**

Note: BackgroundBridge inspection and hosting validation can be completed as an "M1 addendum" as soon as the
information arrives; neither blocks M2 (design system).

## Milestone 2 — Design System ✅

Delivered: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [design/preview.html](design/preview.html) (rendered and checked at 1440 px and 375 px in Edge), decisions D-011 to D-014.

Goal: a documented, accessible visual language before any page is built.
- Finalise color tokens (validated contrast table, AA minimum), including state colors (success/warn/error/focus).
- Type scale (Space Grotesk display, Inter body, JetBrains Mono code/labels), line-heights, fluid sizing via `clamp()`.
- Spacing, radius, elevation, border, grid and container system; breakpoints.
- Motion principles (durations, easing, reduced-motion behavior).
- Component inventory and specs: Button, Link, Nav, Footer, Card (project/service), Tag/Chip, Section header,
  Form controls, Alert/Toast, Timeline item, Code-style label, Skip link.
- Visual direction: 2–3 hero/home concept sketches for owner choice (described or rendered as static HTML mock).
- Output: `docs/DESIGN_SYSTEM.md` (+ tokens prepared for Tailwind in M3).

Acceptance: owner approves direction; contrast table passes AA.

## Milestone 3 — Frontend Foundation ✅

Delivered 2026-11-23: Vite 8 + React 19 + TypeScript 6 (strict) + Tailwind 4 tokens + React Router 8 (lazy routes),
self-hosted fonts, layout shell (skip link, accessible navbar/mobile menu, footer, 404, error boundary), page stubs for
every route, typed content fixtures. Verified: `npm run check` clean, production build OK (initial JS ≈ 105 KB gzip),
30/30 automated browser checks in headless Edge (navigation, focus trap, Escape, scroll lock, 375 px overflow,
reduced motion, 404 routes, no console errors). Lighthouse baseline deferred to M9 (no Lighthouse tooling installed).

- Scaffold `frontend/` with Vite + React + TypeScript (strict) + Tailwind CSS; ESLint + Prettier.
- Design tokens → Tailwind theme; self-hosted fonts.
- React Router routes for all planned pages (stub content), lazy-loaded route chunks.
- Layout shell: skip link, responsive navigation (accessible mobile menu), footer, 404 page.
- Typed content layer: TypeScript types matching the future API contract + local fixtures, so M4 can proceed before
  the backend exists (D-007).
- Acceptance: `npm run build`, type-check, and lint pass; keyboard navigation works; Lighthouse baseline recorded.

## Milestone 4 — Public Website ✅

Delivered 2026-11-23: all pages built (Home with 8 sections, About, Projects, BackgroundBridge case study, Services,
5 service detail pages, Experience, Contact layout, Privacy policy draft, 404). Missing owner facts are `null` in
`frontend/src/content/*` and render as visible `TODO:` placeholders (33 across the site, listed per page in the
M4 report). The inquiry form itself is Milestone 6. Verified: `npm run check` clean, build OK, 193/193 browser
checks (13 routes × 2 viewports: one h1, heading order, no overflow, reveal visibility, one glow max, metadata,
no empty links; plus page-specific behaviour) and 30/30 M3 regression checks.

Pages: Home, About, Projects, BackgroundBridge case study, Services, Service detail (×5), Experience, Contact (UI only),
Privacy Policy, 404.
- All copy verified against CONTENT_CHECKLIST; unknowns stay as `TODO(content)`.
- Case study written only from inspected source (see ARCHITECTURE §8).
- Acceptance: responsive at 360 / 768 / 1024 / 1440 px; reduced-motion respected; no console errors.

## Milestone 5 — Django Backend

- Scaffold `backend/` (Django pinned to host-compatible version, DRF), settings split, env-based config.
- Apps: `profiles`, `projects`, `services`, `inquiries` (D-005). Models, migrations, serializers, read-only viewsets.
- Security baseline (see ARCHITECTURE §7). Tests for models/serializers/endpoints.
- Frontend switched from fixtures to API.
- Acceptance: tests pass; `manage.py check --deploy` clean under prod settings.

## Milestone 6 — Contact System

- `POST /api/v1/inquiries/`: serializer validation, honeypot, minimum-submit-time check, throttling (DB-backed cache).
- Save → then notify by email (failure logged, never fails the request).
- Frontend form (RHF + Zod), accessible errors, success state, fallback email/WhatsApp links.
- Acceptance: tests for valid, invalid, spam, throttled, and email-failure paths.

## Milestone 7 — Admin & Content Management

- Django Admin: list displays, filters, search, ordering, inline editing, image fields with size validation.
- Inquiry admin: status workflow (new / contacted / closed / spam), read-only submitted data, CSV export (optional).
- Admin hardened: non-default URL, strong passwords, login rate limiting (approach decided in M7).

## Milestone 8 — SEO & Analytics

- Per-route title/description/canonical/Open Graph/Twitter tags; JSON-LD (Person, ProfessionalService, CreativeWork for projects).
- `sitemap.xml`, `robots.txt`, OG images.
- Consent banner (necessary vs analytics vs marketing); GA4 / Meta Pixel / Google Ads loaded only after consent,
  using Google Consent Mode v2 defaults = denied. No form PII ever sent to these platforms.

## Milestone 9 — Quality Assurance

- Responsive & cross-browser (Chrome, Firefox, Safari/WebKit, Edge, Android Chrome).
- Accessibility (axe + manual keyboard + screen reader spot check).
- Performance budgets (LCP < 2.5 s on mobile, JS < ~200 KB gzip initial), image optimization.
- Security checks (headers, CSRF, throttling, admin, dependency audit), API tests.
- Content audit: zero `TODO(content)` remaining.

## Milestone 10 — Deployment

- Host-specific production config, static/media serving, HTTPS, domain/DNS, email (SPF/DKIM).
- Deployment runbook, rollback, and backup strategy (SQLite + media).
- **Deploy only with explicit approval.**
