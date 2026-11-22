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

### D-011 · 2026-11-23 · Accepted direction (owner, 2026-11-23); finalised in M2
**Design token contrast adjustments** (finalised in M2). Approximate WCAG ratios on background `#080D18`:
text `#F8FAFC` ≈ 18:1 ✅; muted `#94A3B8` ≈ 7.5:1 ✅; accent `#8B5CF6` ≈ 4.6:1 (borderline AA for body text);
primary `#2563EB` ≈ 3.8:1 ❌ for body text/links (OK for large text, borders, button fills).
White on `#2563EB` ≈ 5.2:1 ✅ (buttons OK); white on `#8B5CF6` ≈ 4.2:1 ❌ for normal text.
*Proposal:* keep `#2563EB` for filled buttons; use a lighter blue (e.g., `#60A5FA`, ≈ 7.6:1) for links/text on dark;
avoid white body text on violet fills. Exact values verified with a contrast tool in M2.
