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

### D-012 · 2026-11-23 · Accepted (owner, 2026-11-23) — hero card partially superseded by D-032 (proposed)
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

### D-025 · 2026-11-23 · Accepted (owner, M6 approval 2026-11-23)
**Signed form token instead of Django CSRF for the inquiry endpoint.** Anonymous-only endpoint, no session; a signed
timestamp from `GET /inquiries/form-token/` (unreadable cross-site without CORS) proves same-origin and enables a
minimum fill time (3 s) and a 24 h expiry. An invalid/expired token returns 400 and the form refreshes it automatically.

### D-026 · 2026-11-23 · Accepted (owner, M6 approval 2026-11-23)
**`REST_FRAMEWORK["NUM_PROXIES"] = 0` by default.** DRF's default trusts any `X-Forwarded-For` header, which would let
bots bypass rate limits. Set `API_NUM_PROXIES` to the host's real proxy count in Milestone 10. Test-covered.

### D-027 · 2026-11-23 · Accepted (owner, M6 approval 2026-11-23)
**Spam is stored, not dropped**, with `status=spam` and a reason (`honeypot` / `too_fast`), so false positives can be
recovered in the admin. No email is sent for spam. Retention/purging is part of Milestone 7.

### D-028 · 2026-11-23 · Accepted (owner, M6 approval 2026-11-23)
**Frontend testing: Vitest 5 + Testing Library + jsdom** (per D-017). `npm run check` now runs the tests too.
Form libraries (React Hook Form, Zod, resolvers) load only in the Contact page chunk.

### D-029 · 2026-11-23 · Accepted (owner direction, 2026-11-23)
**Positioning: Software Engineer, technology-flexible.** Headline "Building Practical Software Solutions."; owner's
introduction text. Replaces "Software Developer (Python / Django / DRF)" as the identity (MASTER_PROMPT §2–§3) and
the draft headline "Python & Django Developer". Python/Django stay as verified skills and project evidence.
Source of truth: [POSITIONING.md](POSITIONING.md). *Conflicts resolved:* MASTER_PROMPT §2, §4, §5, §7; D-012 (hero);
the D-003 rationale ("matches owner's Django/DRF strengths") still holds as a reason for the **site's** stack, not as
an identity statement.

### D-030 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Six services in two categories** (POSITIONING §4): five primary (Web Development, Web Application Development,
Backend and API Development, Mobile Application Development, Business and Custom Software Solutions) and one secondary
(Digital Marketing & Social Media Management, merging the two current social services). Supersedes MASTER_PROMPT §4's
five-service list. *Open:* slugs, scope of the new "Business and Custom Software Solutions" service, and whether each
service is deliverable today (CONTENT_CHECKLIST §G). Existing database rows are not updated by `seed_content`.

### D-031 · 2026-11-23 · Accepted (owner, 2026-11-23)
**Skill tiers: Use / Learning / Interested**, shown in separate groups, never mixed (POSITIONING §3). Needs a `tier`
field on `Skill` (default `use`), exposed in `/api/v1/site/` and `SkillSerializer`, plus a frontend type update.
`category` becomes the capability area (backend / frontend / mobile / database / tool) instead of
language / framework / data / tool. Small schema change, so implementation needs approval.

### D-032 · 2026-11-23 · Accepted (owner, 2026-11-23; design change, reason: D-029 / POSITIONING §5–§6)
**Homepage hero: replace the BackgroundBridge spec card with a "Capabilities" spec card.** Same Concept A component
style (mono spec sheet, one glow). It lists the capability areas backed by verified skills. The mobile
"Featured: BackgroundBridge →" link is removed. BackgroundBridge stays in "01 / Selected work" as one card among the
selected projects. Partially supersedes D-012 (section order otherwise unchanged) and DESIGN_SYSTEM §"Homepage" item 1.
*Reason:* the new direction forbids BackgroundBridge as the defining identity or disproportionately prominent.

### D-033 · 2026-11-23 · Accepted (owner asked for the fix, 2026-11-23)
**Seeding tracks what it created (`SeedRecord`).** Fixes two review bugs: (1) `Profile.load()` no longer creates a
row on read; it returns an unsaved default, so an early `GET /api/v1/site/` can't block the profile seed;
(2) a project or service deleted in the admin was recreated, and published, by the next `seed_content`. Each seeded
item now gets a record and is never created twice; new items in `content.json` are still created. A database
seeded before this change is adopted (recorded, nothing created). *Alternatives rejected:* seeding only into empty
tables (new services could never be added later); seeding projects unpublished (a fresh install would show none).

### D-034 · 2026-11-23 · Accepted (owner asked for the fix, 2026-11-23); amends D-025
**Inquiry form tokens are single use and unique.** A token is consumed after the fields validate (so a visitor can
fix a typo and resend) and remembered in the default cache (DatabaseCache in production, shared across workers)
until it expires. A reused token gets the same 400 as an expired one, and the existing form recovery fetches a new
token. Tokens now sign a random value: signing a constant gave identical tokens to visitors who loaded the form in
the same second. The lifetime stays 24 h.

### D-035 · 2026-11-23 · Accepted (owner, M7 approval 2026-11-23)
**Admin sign-in rate limiting built in, no package.** A custom `AdminSite` (`config/admin_site.py`, installed via
`config.apps.PortfolioAdminConfig`) refuses sign-in POSTs from an IP after `ADMIN_LOGIN_MAX_FAILURES` (5) failures,
until `ADMIN_LOGIN_LOCKOUT_SECONDS` (900) pass without another failure. Counts live in the default cache (shared
DatabaseCache in production), keyed by a hash of the IP. Per IP, not per username, so nobody can lock the owner
out from elsewhere. *Alternative:* django-axes. It is more complete but adds a dependency and its own tables, which
is too much for a single-admin site.

### D-036 · 2026-11-23 · Accepted (owner, M7 approval 2026-11-23)
**No CSV export of inquiries.** It was optional in the plan. It would add a one-click bulk export of visitors'
personal data for little benefit at this volume. Revisit if the owner needs it.

### D-037 · 2026-11-23 · Accepted (owner, M7 approval 2026-11-23)
**Retention is configured, not assumed.** `purge_inquiries` deletes inquiries older than `INQUIRY_RETENTION_DAYS` and
spam older than `INQUIRY_SPAM_RETENTION_DAYS`. Both are unset by default, and then it deletes nothing: the period is
the owner's decision and must match the Privacy Policy (CONTENT_CHECKLIST §H). Scheduling is part of Milestone 10.
Image uploads are capped at 2 MB and limited to JPG/PNG/WebP (`apps/uploads.py`). Django has no built-in per-file cap.
