# Architecture

Status: **Proposed** (Milestone 1). Items marked *(open)* are finalised once hosting details are known.

## 1. Overview

```
                    ┌──────────────────────── same domain (preferred) ────────────────────────┐
 Browser ──HTTPS──▶ │  /                 → SPA shell (index.html with per-route SEO meta)     │
                    │  /assets/*         → hashed static JS/CSS/fonts (long cache)            │
                    │  /api/v1/*         → Django REST Framework (JSON)                        │
                    │  /<admin-path>/    → Django Admin                                        │
                    │  /media/*          → uploaded images (project screenshots, OG images)    │
                    │  /sitemap.xml, /robots.txt → Django                                      │
                    └──────────────────────────────────────────────────────────────────────────┘
                                         │
                                    SQLite DB  +  SMTP (host mail) for inquiry notifications
```

- The React app is **built locally** (`npm run build`) and uploaded as static files — the host does not need Node.js.
- Django runs under the host's Python app support (e.g., Passenger/WSGI on cPanel) *(open)*.
- Same-domain API → no CORS in production, simpler CSRF, one SSL certificate.

## 2. Frontend

| Concern | Choice | Notes |
|---|---|---|
| Framework | React + TypeScript (strict) | |
| Build | Vite | Code-splitting per route |
| Styling | Tailwind CSS (v4, CSS-first `@theme` tokens) | Tokens from M2 design system |
| Routing | React Router (declarative/library mode) | Lazy routes |
| Forms | React Hook Form + Zod | Zod schema mirrors DRF serializer |
| Icons | Lucide (tree-shaken named imports) | |
| Motion | `motion` — only where it adds meaning | Gated on `prefers-reduced-motion` |
| Fonts | Self-hosted (e.g., `@fontsource-variable/*`) | No Google Fonts request (privacy + speed) |
| Data fetching | Small typed `fetch` wrapper + hooks | No extra library unless justified |

Proposed structure (created in M3):

```
frontend/src/
├── app/            router, providers, layout shell
├── pages/          route-level components (Home, About, Projects, CaseStudy, Services, ServiceDetail, Experience, Contact, Privacy, NotFound)
├── components/     ui/ (primitives) · sections/ (page sections) · layout/ (Nav, Footer)
├── features/       contact/ (form, schema, api) · consent/ (M8)
├── lib/            api client, seo helpers, utils
├── content/        typed fixtures used until the API exists (removed/merged in M5)
├── types/          API contract types
└── styles/         Tailwind entry + tokens
```

### Routes (proposed URLs)

| Page | URL |
|---|---|
| Home | `/` |
| About | `/about` |
| Projects | `/projects` |
| Case study | `/projects/backgroundbridge` (generic `/projects/:slug`) |
| Services | `/services` |
| Service detail | `/services/:slug` (`website-development`, `web-app-api-development`, `social-media-management`, `social-media-advertising`, `mobile-app-development`) |
| Experience | `/experience` |
| Contact | `/contact` |
| Privacy | `/privacy` |
| 404 | `*` (served with HTTP 404 status by Django for unknown paths — see §6) |

## 3. Backend

- Django **5.2 LTS** proposed (security support to April 2028; Python 3.10–3.14). Final pin depends on the host's Python. *(open)*
- Django REST Framework; `django-cors-headers` for **local development only** (Vite dev server on :5173).
- Settings: `config/settings/{base,dev,prod}.py`, env-driven (see `.env.example`).

Proposed structure (created in M5):

```
backend/
├── manage.py
├── config/            settings/, urls.py, wsgi.py
├── apps/
│   ├── profiles/      Profile (singleton), SocialLink, Skill, Experience, Education, Certification
│   ├── projects/      Project, ProjectImage, Technology
│   ├── services/      Service, ServiceFeature
│   └── inquiries/     Inquiry (+ notification service)
├── templates/         spa_shell.html (SEO meta injection)
└── requirements/      base.txt, dev.txt, prod.txt
```

### Why four apps, not seven
Experience, Education and Achievements are small, read-only lists tied to the single profile and never used independently;
separate apps would add boilerplate without benefit. They live in `profiles` and can be split later if they grow. (D-005)

### Draft data model

```
Profile (singleton)     name, headline, short_bio, long_bio, location_public, email_public, whatsapp_public (opt),
                        resume_file (opt), photo, open_to_work (bool), availability_note, updated_at
SocialLink              profile→, platform, url, order
Skill                   name, category (language/framework/tool/...), level_label (e.g. "Basic") (opt), order, is_featured
Experience              title, organization, organization_url (opt), start_date, end_date (null=present), summary, highlights, order
Education               institution, degree, field, start_date, end_date/expected, status, notes, order
Certification           name, issuer, issue_date, credential_url (opt), order
Project                 title, slug, summary, problem, solution, role, outcome (verified only), is_featured, order,
                        repo_url (opt), live_url (opt), cover_image, status (draft/published), seo_title, seo_description
ProjectImage            project→, image, alt_text, caption, order
Technology              name (M2M with Project)
Service                 title, slug, tier (primary/secondary), summary, description, scope_included, scope_excluded,
                        benefits, icon_name, order, is_active, seo_title, seo_description
Inquiry                 name, email, company, whatsapp, service→ (nullable), message, budget_range, timeline,
                        status (new/contacted/closed/spam), ip_hash, user_agent, created_at, notified_at, notify_error
```

Notes: no "skill percentage"; `level_label` only when truthful. Inquiry stores a **hashed** IP (for abuse control) rather than raw IP.

### Draft API (`/api/v1/`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/profile/` | Profile + social links + skills |
| GET | `/experience/` · `/education/` · `/certifications/` | Lists |
| GET | `/projects/` · `/projects/{slug}/` | Published projects |
| GET | `/services/` · `/services/{slug}/` | Active services |
| POST | `/inquiries/` | Create inquiry (throttled, the only public write) |

Responses are versioned, paginated where lists may grow, and cacheable (`Cache-Control`) for public GETs.

## 4. Inquiry flow

1. Client validates (Zod) → `POST /api/v1/inquiries/` with CSRF token (same-origin).
2. Server: throttle check (DRF `AnonRateThrottle` backed by Django **DatabaseCache** — shared across worker processes,
   no Redis) → honeypot must be empty → minimum time-to-submit check (signed timestamp) → serializer validation.
3. **Save to DB** (transaction committed).
4. Attempt email notification to owner (SMTP via host). On failure: log, store `notify_error`; response is still `201`.
5. Return `201` with a generic success message. Spam/honeypot hits return a **generic success** (don't teach bots) but are stored as `spam` or dropped.
6. No auto-reply/promotional email. No data sent to analytics/ad platforms; conversion events (M8) carry no PII.

Optional later (needs approval): Cloudflare Turnstile CAPTCHA (free) if spam gets through.

## 5. SEO strategy *(decision in M3/M8, see D-006)*

Problem: a pure client-rendered SPA serves the same empty `index.html` for every URL. Social crawlers (Facebook,
LinkedIn, WhatsApp, X) **do not run JavaScript**, so per-page Open Graph previews would be wrong.

Recommended: **Django renders the SPA shell** — a Django view serves `index.html` (from the Vite build manifest) as a
template, injecting per-route `<title>`, description, canonical, OG/Twitter tags and JSON-LD from the database; React
then renders the page. This keeps one source of truth (Django Admin) and correct previews without SSR.
Alternative: build-time prerendering of each route to static HTML (requires a rebuild when content changes).

Also: real HTTP 404 status for unknown URLs, `sitemap.xml` from Django sitemaps, `robots.txt`, optimized responsive images (WebP/AVIF).

## 6. Routing ownership in production

Django URL order: `/api/v1/` → admin → `sitemap.xml`/`robots.txt` → static/media → known SPA routes (shell view, 200) →
everything else (shell view with 404 status). Hashed `/assets/*` served directly by the web server where possible
(WhiteNoise as fallback — D-008 *(open)*).

## 7. Security baseline

- Secrets only in environment; `.env` never committed; `DEBUG=False` in prod.
- `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` strict; `SECURE_SSL_REDIRECT`, secure + HttpOnly cookies, HSTS (after HTTPS verified).
- Security headers: CSP (self-hosted assets make a strict CSP feasible; analytics domains added only when consented scripts exist),
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`.
- Public API read-only; inquiry endpoint throttled, size-limited, validated. Admin on non-default path.
- Uploaded images: type/size validation; never user-uploaded from public site.
- Dependencies pinned; `pip-audit` / `npm audit` in QA.
- Privacy: inquiry retention period defined in Privacy Policy; IP stored hashed.

## 8. BackgroundBridge case study method

Status: **inspected 2026-11-23** — findings in [BACKGROUNDBRIDGE_AUDIT.md](BACKGROUNDBRIDGE_AUDIT.md).

Inspection procedure (read-only; nothing in that folder is modified):
1. Inventory: `settings`, `INSTALLED_APPS`, `urls.py`, models, views/viewsets, serializers, templates, management commands, tests, requirements, deploy files.
2. Trace each candidate feature end-to-end (URL → view → model/service → template/serializer). Only traced features are claimed.
3. Note security posture (auth, permissions, secret handling) — for the case study narrative only; secrets are never copied.
4. Identify screenshot opportunities; screenshots taken only with dummy data.
5. Record findings in `docs/BACKGROUNDBRIDGE_AUDIT.md` with file references; the owner reviews before any public copy is written.
