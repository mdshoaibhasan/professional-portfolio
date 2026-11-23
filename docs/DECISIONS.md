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

### D-008 · 2026-11-23 · Resolved by D-042 (WhiteNoise)
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

### D-026 · 2026-11-23 · Superseded by D-044 (2026-11-23)
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

### D-038 · 2026-11-23 · Accepted (owner, M8 approval 2026-11-23); implements D-006
**Per-URL metadata is rendered by Django; descriptions live only on the server.** `apps/seo` serves the built
`index.html` with title, description, canonical, Open Graph/Twitter and JSON-LD for each URL. Crawlers fetch every URL
directly, so the React `<Seo>` component now only sets the tab title during in-app navigation, and removes the
server's `<title>` at start-up so there is never a second one. JSON-LD uses only owner-supplied facts: no `Person`
without a name, `knowsAbout` only "use"-tier skills, no email or phone. The default social image carries no name, so it
can't go stale. *Requirement for M10:* the web server must serve `dist` files before requests reach Django.

### D-039 · 2026-11-23 · Accepted (owner, M8 approval 2026-11-23)
**Consent: opt-in, basic Consent Mode v2, banner only when something needs consent.** Categories are necessary,
analytics (GA4) and marketing (Google Ads, Meta Pixel). Nothing is pre-ticked; accept and reject look the same; the
banner doesn't block the page or trap focus. No Google or Meta script is requested before consent ("basic" mode, not
"advanced" cookieless pings). The choice is stored in `localStorage` (`consent.v1`). Withdrawing consent reloads
the page, because loaded scripts can't be unloaded. With no IDs configured (today) there is no banner and no
third-party request at all. The only conversion is a parameterless lead event. Google Ads conversion labels are not
supported until the owner has an Ads account.

### D-040 · 2026-11-23 · Accepted (owner, M9 approval 2026-11-23)
**QA tooling: `axe-core` as the only new (dev-only) dependency.** The plan names axe for accessibility. It runs inside
`frontend/scripts/qa.mjs`, which drives the installed Chrome/Edge over the DevTools Protocol with Node built-ins.
No Playwright, Puppeteer or Lighthouse: the budgets (LCP, initial JS gzip) are measured directly. `pip-audit` ran
from a throwaway virtualenv and is not a project dependency. Nothing here ships to visitors.

### D-041 · 2026-11-23 · Accepted (owner, M9 approval 2026-11-23)
**Content-Security-Policy on public pages, Permissions-Policy everywhere.** Pages: everything from this origin; no
inline scripts or styles; `font-src data:` for the one font Vite inlines; `frame-ancestors 'none'`. Tracker hosts are
added only through `CSP_TRACKERS`, which must match the build-time `VITE_*` IDs. A mismatch fails safe (the tracker
is blocked, never the site). The admin keeps Django's defaults without a CSP: its widgets aren't worth the breakage
risk. Proven on a production-like setup: all pages and a real form submission, zero violations.

### D-042 · 2026-11-23 · Accepted (owner, Railway plan approval 2026-11-23); resolves D-008
**gunicorn and WhiteNoise in `requirements/prod.txt`.** Railway has no web server in front of Django: gunicorn runs
it, and WhiteNoise serves the collected admin files and the built frontend (`WHITENOISE_ROOT = FRONTEND_DIST_DIR`;
hashed files cached for a year; raw `/index.html` gets the CSP). Both are pure Python and work under Passenger on
cPanel; gunicorn is simply unused there. `requirements/dev.txt` now includes `prod.txt`, so production settings can
be checked locally.

### D-043 · 2026-11-23 · Accepted (owner, Railway plan approval 2026-11-23)
**Railway via Railpack and two scripts, with no Railway config file and no Docker.** `railway.json`/`railway.toml`
stop being read on 2026-12-01, so build and start commands are dashboard settings pointing at
`deploy/railway/build.sh` and `start.sh`; `railpack.json` only selects Python 3.12 and Node 22. Migrations run at
start because the volume isn't mounted during build or pre-deploy. `start.sh` refuses to run unless
`SQLITE_PATH`/`MEDIA_ROOT` are inside `RAILWAY_VOLUME_MOUNT_PATH` (no silent data loss), backs up before pending
migrations, and runs 1 gunicorn worker with 4 threads (512 MB limit). SQLite is kept; cPanel uses
`backend/passenger_wsgi.py`. *Fallback if Railpack can't install both runtimes:* a Railway-only Dockerfile, which
needs owner approval.

### D-044 · 2026-11-23 · Accepted (owner, Railway plan approval 2026-11-23); supersedes D-026
**One trusted client-IP source: `CLIENT_IP_HEADER`.** DRF's `NUM_PROXIES` only reads `X-Forwarded-For`, which
Railway doesn't document; Railway documents `X-Real-IP`. `config/client_ip.py` uses the connection address by
default, or exactly one configured header, and rejects values that aren't valid IPs. It is used by the API
throttles (`config/throttles.py`), the inquiry IP hash and the admin lockout. Configure it only for a proxy that
overwrites the header; DEPLOYMENT.md A4 has the spoofing check to run before trusting it.

### D-045 · 2026-11-23 · Accepted (owner, Railway plan approval 2026-11-23)
**Demo deployments are noindex; uploads can be served by Django.** `SEO_ALLOW_INDEXING=False` adds
`X-Robots-Tag: noindex, nofollow` to every response and a matching meta tag, and drops the sitemap line from
robots.txt. Crawling stays allowed so crawlers can read the noindex. This hides the site from search results; it
does not make it private. `SERVE_MEDIA=True` lets Django serve `MEDIA_ROOT` where no web server does (Railway).
Both default to cPanel-friendly values.

### D-046 · 2026-11-23 · Accepted (owner, Railway plan approval 2026-11-23)
**Backups with SQLite's online-backup API (`apps/ops`: `backup_db`, `restore_db`).** A raw copy of a live SQLite
file can be inconsistent. Snapshots are integrity-checked, pruned (pre-restore safety copies are never pruned), and
restore refuses files that aren't intact Django databases, saves the current data first, then migrates. The same
commands run from cron on cPanel. Transfer on Railway uses the documented `railway volume files` / `scp` commands,
to be confirmed on the first deployment.
Also: `purge_inquiries` now deletes only *closed* inquiries (and spam) past retention, never new or contacted ones.
The previous version deleted any old non-spam inquiry, which contradicted the Privacy Policy's "unless they lead to
an ongoing project". Found while preparing deployment, before any deletion had happened.
