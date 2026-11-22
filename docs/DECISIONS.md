# Decision Log

Format: ID · date · status (Proposed / Accepted / Superseded) · decision · rationale · alternatives.
Owner approval moves a decision from Proposed to Accepted.

---

### D-001 · 2026-11-23 · Accepted (by owner)
**Replace three empty placeholder directories.** The workspace contained empty *directories* named `.gitignore`,
`CLAUDE.md`, `README.md` (blocking creation of the real files). Removed with explicit owner permission; `docs/` kept.

### D-002 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Monorepo with `frontend/` and `backend/`.** One repository, two clearly separated apps, shared docs.
*Rationale:* single owner, coordinated releases, one place for API contract changes. *Alternative:* two repos — more overhead, no benefit here.

### D-003 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Keep the proposed stack** (React/TS/Vite/Tailwind/React Router/Lucide/RHF/Zod/Motion + Django/DRF/SQLite).
*Rationale:* matches owner's Django/DRF strengths (the backend itself becomes portfolio evidence) while giving a modern,
fast frontend. All packages are free/open-source. *Caveat:* SPA SEO needs D-006. *Alternative considered:* Django templates
only (simpler hosting, server-rendered SEO) — rejected because the owner specified React and wants a premium interactive UI;
can be revisited if hosting is very restrictive.

### D-004 · 2026-11-23 · Accepted in principle (owner, 2026-11-23); final pin pending host Python
**Django 5.2 LTS.** Security support until April 2028; supports Python 3.10–3.14. If the host offers only Python < 3.10,
we must discuss options (Django 4.2 LTS reached end of support in April 2026, so it is **not** acceptable for new work).

### D-005 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Four Django apps:** `profiles` (profile, social links, skills, experience, education, certifications), `projects`,
`services`, `inquiries`. *Rationale:* spec says avoid unnecessary apps; experience/education/achievements are small
profile sub-lists. Splitting later is cheap.

### D-006 · 2026-11-23 · Accepted direction (owner, 2026-11-23); confirm in M3/M8
**SEO via Django-rendered SPA shell** (per-route meta + JSON-LD injected into Vite's `index.html`). *Rationale:* social
crawlers don't execute JS; avoids SSR complexity; content stays editable in Django Admin. *Alternative:* build-time
prerendering — good if hosting is static-only.

### D-007 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Contract-first content layer.** Milestones 3–4 precede the backend, so the frontend uses typed local fixtures shaped
exactly like the planned API responses; M5 swaps fixtures for API calls without page rewrites.

### D-008 · 2026-11-23 · Open
**Static file serving in production** — host web server directly vs. WhiteNoise. Decided after hosting details (M10).

### D-009 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Throttling backend = Django DatabaseCache** (no Redis). Works across multiple Passenger/WSGI processes, zero extra services.

### D-010 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Self-hosted fonts** (no Google Fonts CDN). Faster, no third-party request before consent, enables strict CSP.

### D-011 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Design token contrast adjustments** (finalised in M2). Approximate WCAG ratios on background `#080D18`:
text `#F8FAFC` ≈ 18:1 ✅; muted `#94A3B8` ≈ 7.5:1 ✅; accent `#8B5CF6` ≈ 4.6:1 (borderline AA for body text);
primary `#2563EB` ≈ 3.8:1 ❌ for body text/links (OK for large text, borders, button fills).
White on `#2563EB` ≈ 5.2:1 ✅ (buttons OK); white on `#8B5CF6` ≈ 4.2:1 ❌ for normal text.
*Proposal:* keep `#2563EB` for filled buttons; use a lighter blue (e.g., `#60A5FA`, ≈ 7.6:1) for links/text on dark;
avoid white body text on violet fills. Exact values verified with a contrast tool in M2.

### D-012 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Homepage reduced from 13 listed sections to 8** (Hero incl. intro + technical highlights + BackgroundBridge spec card →
Selected work → Services → About & stack → Process → Experience & education → Contact CTA → Footer).
*Rationale:* spec asks to avoid unnecessary sections and to show identity + strongest project within seconds.
On mobile the spec card falls below the first viewport, so the hero gets a one-line "Featured: BackgroundBridge →" link there.

### D-013 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Visual direction: Concept A "Engineering Spec"** (mono spec sheets, numbered sections, hairline grid, one glow per page)
over Concept B "Editorial Studio". *Rationale:* credibility as a developer is the primary goal. See DESIGN_SYSTEM.md §1.

### D-014 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Final token adjustments:** form-field borders use `subtle #64748B` (meets 3:1 non-text contrast; `border-strong` at 1.88
does not); white text on violet only on `accent-strong #7C3AED` (5.70); `#64748B` never used for text.

### D-015 · 2026-11-23 · Accepted (owner, 2026-11-23)
**TypeScript 6.0 instead of 7.0.** TS 7 (native Go port) is the latest release, but `typescript-eslint` supports only
`<6.1`. Revisit when typescript-eslint adds TS 7 support. Also: `baseUrl` removed (deprecated in TS 6); `paths` used alone.

### D-016 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Token class names in code:** `canvas` (page bg), `fg` / `fg-secondary` (text), `line` / `line-strong` (borders) replace
`bg` / `text` / `border` from DESIGN_SYSTEM.md, which would otherwise produce `bg-bg`, `text-text`, `border-border`.
Tailwind's default palette is disabled so only approved colors can be used.

### D-017 · 2026-11-23 · Accepted (owner, 2026-11-23)
**No test runner yet.** M3 verification uses type-check, lint, build and a scripted headless-browser check.
Vitest + Testing Library will be proposed in M6, when the contact form adds real client-side logic.
Motion, React Hook Form and Zod are also deferred until a component needs them.

### D-018 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Missing facts are `null`, rendered by `<Fact>` / `<Todo>`.** Placeholders are visible (dashed amber `TODO:` badge,
`data-todo-content` attribute) so nothing invented can slip through; Milestone 9 adds a build check that fails if any remain.

### D-019 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Case-study content held back until the owner answers audit §8:** crypto payment providers, the "Protect" module,
the automated test count (suite not executed), the repository link, and the owner's role. Wording uses only verified facts.

### D-020 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Status-neutral education wording** ("My background is in Computer Science and Engineering") until the owner confirms
graduation status — the expected graduation month (November 2026) is the current month.

### D-021 · 2026-11-23 · Accepted (owner, 2026-11-23)
**One `/api/v1/site/` endpoint** for profile, social links, skills, experience, education, certifications and process
steps (needed by the layout and most pages). Homepage needs 3 requests instead of 8. Projects and services keep
their own list/detail endpoints.

### D-022 · 2026-11-23 · Accepted (owner, 2026-11-23)
**No `django-cors-headers`.** Vite proxies `/api` in development and production is same-domain, so CORS never applies.

### D-023 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Content lives in the database, loaded by React Router loaders.** Frontend fixtures were exported to
`backend/apps/profiles/seed/content.json` and removed; `seed_content` loads them (only into empty tables). Backend
tests assert the API returns exactly the seeded content. Page-level API errors render inside the layout; if the API
is down, a standalone error page is shown.

### D-024 · 2026-11-23 · Accepted (owner, 2026-11-23)
**API safety defaults:** DRF denies by default (`IsAuthenticated`), public views opt in via a read-only base
(GET/HEAD/OPTIONS only, `AllowAny`); JSON-only renderer in production; anonymous throttle 120/min backed by the
database cache in production (D-009). `Profile` refuses a second create instead of silently overwriting.
HSTS include-subdomains/preload stay off (their deploy-check warnings are silenced on purpose) until Milestone 10.
