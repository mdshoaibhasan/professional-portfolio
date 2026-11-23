# Project Plan & Roadmap

Status legend: ✅ done · 🟡 awaiting approval · ⏳ not started · ⛔ blocked

| # | Milestone | Status | Blocked by |
|---|---|---|---|
| 1 | Project Audit & Planning | ✅ Approved 2026-11-23 (hosting + BackgroundBridge Q&A still open) | — |
| 2 | Design System | ✅ Approved 2026-11-23 | — |
| 3 | Frontend Foundation | ✅ Approved 2026-11-23 | — |
| 4 | Public Website | ✅ Approved 2026-11-23 (placeholders until owner content arrives) | — |
| 5 | Django Backend | ✅ Approved 2026-11-23 | Host Python version (final pin) |
| 6 | Contact System | ✅ Approved 2026-11-23 | SMTP details for real email (console backend until provided) |
| 7 | Admin & Content Management | ✅ Approved 2026-11-23 | Retention period (owner decision) |
| 8 | SEO & Analytics | ✅ Approved 2026-11-23 | Domain name, tracker IDs (owner) |
| 9 | Quality Assurance | ✅ Approved 2026-11-23 (content gate still open: release check fails until placeholders are filled) | Owner content (20 placeholders) |
| 10 | Deployment | 🟡 Stage 1 done: Railway demo **live** and fully verified (https://portfolio-production-78c3b121.up.railway.app). Stage 2 (cPanel) not started | Owner content (placeholders), cPanel host |

Each milestone ends with: verification → doc updates → report → **approval gate** → Git checkpoint commit (with approval).

### Cross-cutting: Positioning update — Software Engineer (D-029) 🟡

- [x] 2026-11-23 Docs updated: [POSITIONING.md](POSITIONING.md) (new), MASTER_PROMPT amendment note, CLAUDE.md,
      DECISIONS (D-029 to D-032), CONTENT_CHECKLIST (§A, §E, §F, §G), ARCHITECTURE, DESIGN_SYSTEM §7, README.
- [x] 2026-11-23 D-030 to D-032 approved and implemented (POSITIONING §7): seed + local DB content, `Skill.tier`
      (migration `profiles/0002`), page copy, hero Capabilities card, six-service layout. Verified: 36 backend
      tests, ruff, no missing migrations; frontend check (19 tests) + build; desktop and true-375 px screenshots
      (no horizontal overflow on /, /services, /about, a service detail page).
- [ ] 🟡 Awaiting owner review of the draft service copy and approval of this change set.
- ⛔ Partly blocked by owner answers: CONTENT_CHECKLIST §F (PHP/CSS/JS, learning list) and §G (service scopes).

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

## Milestone 5 — Django Backend ✅

Delivered 2026-11-23: Django 5.2.19 LTS + DRF 3.18.3 backend (settings split, env config, prod fail-fast checks),
apps `profiles` / `projects` / `services`, read-only public API (`/api/v1/site/`, `projects/`, `services/`),
basic admin, idempotent `seed_content`. Frontend now loads all content via React Router loaders; local fixtures
removed. Verified: 21 backend tests (incl. API ↔ seed round-trip, query count, prod `check --deploy`), ruff clean,
no missing migrations; frontend check + build; 199/199 browser checks against the live API, 30/30 M3 regression,
API-down fallback. `inquiries` app moved to Milestone 6.

- Scaffold `backend/` (Django pinned to host-compatible version, DRF), settings split, env-based config.
- Apps: `profiles`, `projects`, `services`, `inquiries` (D-005). Models, migrations, serializers, read-only viewsets.
- Security baseline (see ARCHITECTURE §7). Tests for models/serializers/endpoints.
- Frontend switched from fixtures to API.
- Acceptance: tests pass; `manage.py check --deploy` clean under prod settings.

## Milestone 6 — Contact System ✅

Delivered 2026-11-23: `inquiries` app (model, read-only admin with editable status), `POST /api/v1/inquiries/`
and `GET /api/v1/inquiries/form-token/`; save-then-notify with failure recorded, honeypot, signed form token with
minimum fill time, per-IP rate limit (spoofed X-Forwarded-For ignored), hashed IP, no PII in logs. Frontend form
with React Hook Form + Zod, inline accessible errors, server error mapping, expired-token recovery, rate-limit and
network messages with email fallback. Verified: 36 backend tests, 19 frontend tests (Vitest), real browser
submission end-to-end (stored, emailed with Reply-To, success focused), 199/199 page checks, 30/30 regression.
Privacy policy corrected to state how IPs are actually handled.
Backend review fixes (2026-11-23, D-033/D-034): reading the API no longer creates the profile; `seed_content` never recreates deleted content (`SeedRecord`, migration `profiles/0003`); form tokens are unique and single use. 44 backend tests.

- `POST /api/v1/inquiries/`: serializer validation, honeypot, minimum-submit-time check, throttling (DB-backed cache).
- Save → then notify by email (failure logged, never fails the request).
- Frontend form (RHF + Zod), accessible errors, success state, fallback email/WhatsApp links.
- Acceptance: tests for valid, invalid, spam, throttled, and email-failure paths.

## Milestone 7 — Admin & Content Management ✅

Delivered 2026-11-23: hardened admin site with per-IP sign-in rate limiting (5 failures → 15 min, D-035); image
uploads capped at 2 MB, JPG/PNG/WebP only (profile photo, project covers); bulk inquiry status actions; search on
projects, services, skills, experience and case-study sections; `purge_inquiries` retention command (deletes nothing
until the owner sets a period, D-037). CSV export skipped (D-036). Verified: 61 backend tests (17 new, incl. every
admin page rendering), ruff, no missing migrations.

- Django Admin: list displays, filters, search, ordering, inline editing, image fields with size validation.
- Inquiry admin: status workflow (new / contacted / closed / spam), read-only submitted data, CSV export (optional).
- Admin hardened: non-default URL, strong passwords, login rate limiting (approach decided in M7).

## Milestone 8 — SEO & Analytics ✅

Delivered 2026-11-23: new `apps/seo`. Django serves the built `index.html` for every page URL with its title,
description, canonical, Open Graph/Twitter tags and JSON-LD (Person, WebSite, ProfilePage, CreativeWork, Service,
only from facts the owner supplied). Real 404 status plus `noindex` for unknown, unpublished and inactive pages.
`sitemap.xml`, `robots.txt` (admin path not revealed), 1200×630 `og-default.png` (source:
`docs/design/og-default.html`). Production refuses a missing, non-https or localhost `SITE_URL`. Consent banner
(necessary / analytics / marketing, nothing pre-ticked, equal accept/reject) and GA4 / Google Ads / Meta Pixel
loaders under basic Consent Mode v2: nothing loads before consent, and with no IDs configured there is no banner.
Lead event without form data. Privacy Policy cookie section follows the configured trackers. Found and fixed during
testing: unescaped JSON-LD (XSS) and API 404s falling through to the HTML shell. Verified: 76 backend tests,
32 frontend tests, build, live checks against Django and headless Edge (no third-party script before consent).

- Per-route title/description/canonical/Open Graph/Twitter tags; JSON-LD (Person, ProfessionalService, CreativeWork for projects).
- `sitemap.xml`, `robots.txt`, OG images.
- Consent banner (necessary vs analytics vs marketing); GA4 / Meta Pixel / Google Ads loaded only after consent,
  using Google Consent Mode v2 defaults = denied. No form PII ever sent to these platforms.

## Milestone 9 — Quality Assurance ✅

Delivered 2026-11-23, full results in [QA_REPORT.md](QA_REPORT.md). `npm run qa` browser QA (axe WCAG 2.2 AA, errors,
headings, overflow, alt, names, keyboard) over all 30 page views: 0 failures in Edge and Chrome, also on a
production-like setup. `npm run qa:perf`: LCP ≤ 2.3 s, initial JS 112 KB gzip. Content-Security-Policy and
Permissions-Policy added (D-041). One accessibility fix (links in text underlined). npm audit and pip-audit clean;
79 backend tests, 32 frontend tests. **Not passed:** zero placeholders (20 remain, owner content). Firefox,
Safari/iOS, Android and screen-reader checks are listed for the owner (QA_REPORT §7).

- Responsive & cross-browser (Chrome, Firefox, Safari/WebKit, Edge, Android Chrome).
- Accessibility (axe + manual keyboard + screen reader spot check).
- Performance budgets (LCP < 2.5 s on mobile, JS < ~200 KB gzip initial), image optimization.
- Security checks (headers, CSRF, throttling, admin, dependency audit), API tests.
- Content audit: zero `TODO(content)` remaining.

## Milestone 10 — Deployment 🟡

Owner decision 2026-11-23: Stage 1 **Railway Free** (temporary noindex demo, placeholders accepted for the demo
only), Stage 2 **cPanel shared hosting** (production). Prepared 2026-11-23, **not yet deployed**:
- gunicorn + WhiteNoise (D-042); `railpack.json`, root `requirements.txt`, `deploy/railway/build.sh` and
  `start.sh` (volume guard, pre-migration backup, 1 worker) (D-043); `backend/passenger_wsgi.py` for cPanel.
- Trusted client-IP header replacing `API_NUM_PROXIES` (D-044); demo noindex and optional media serving (D-045);
  `backup_db` / `restore_db` (D-046); `purge_inquiries` limited to closed inquiries and spam.
- [DEPLOYMENT.md](DEPLOYMENT.md) rewritten: Part A Railway, Part B cPanel.
- 2026-11-23: **deployed** to https://portfolio-production-78c3b121.up.railway.app (Railway trial account, noindex demo). Verified live: pages, static files,
  API, security headers, noindex, browser QA (Edge and Chrome), live form submission, X-Real-IP spoofing check,
  restart persistence, admin sign-in, backup → download → integrity check → restore. Measured 64–84 MB RAM.
- Remaining for production: content placeholders, cPanel host (Part B).

- Host-specific production config, static/media serving, HTTPS, domain/DNS, email (SPF/DKIM).
- Deployment runbook, rollback, and backup strategy (SQLite + media).
- **Deploy only with explicit approval.**
