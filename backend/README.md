# backend/

Django 5.2 LTS + Django REST Framework: the public content API and Django Admin.
Includes the contact-form inquiry system. See [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) §3.

## Setup (Windows, Git Bash)

Run every command from `backend/`. The virtualenv is not activated, so commands call its executables by path.

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements/dev.txt
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py seed_content      # initial content; safe to re-run
.venv/Scripts/python.exe manage.py createsuperuser   # for the admin (see note below)
.venv/Scripts/python.exe manage.py runserver         # http://127.0.0.1:8000
```

- **Environment file (optional in development):** copy `../.env.example` to `../.env`, i.e. the **repository root**,
  not `backend/`. Real environment variables take precedence over the file.
- **`createsuperuser` password prompt:** if it does not respond in Git Bash's default terminal (mintty), run
  `winpty .venv/Scripts/python.exe manage.py createsuperuser`, or use PowerShell or the VS Code terminal.
- The admin is at `http://127.0.0.1:8000/<DJANGO_ADMIN_PATH>/` (`admin` by default in development).

Run the frontend (`cd frontend && npm run dev`) alongside it: Vite proxies `/api` to Django, so the browser
only ever talks to one origin.

## Commands

| Command (from `backend/`) | What it does |
|---|---|
| `.venv/Scripts/python.exe manage.py test` | Run the test suite |
| `.venv/Scripts/ruff.exe check . && .venv/Scripts/ruff.exe format --check .` | Lint and formatting check (**must pass before any commit**) |
| `.venv/Scripts/python.exe manage.py makemigrations --check --dry-run` | Confirm no model change is missing a migration |
| `.venv/Scripts/python.exe manage.py seed_content` | Load initial content from `apps/profiles/seed/content.json` (details below) |
| `.venv/Scripts/python.exe manage.py purge_inquiries --dry-run` | Show which inquiries are past the retention period; drop `--dry-run` to delete them. Does nothing until `INQUIRY_RETENTION_DAYS` / `INQUIRY_SPAM_RETENTION_DAYS` are set |

**`seed_content`** creates each item (the profile, each list, each service/project slug) at most once, tracked
in `SeedRecord`. Admin edits are never overwritten and deleted content never comes back. New items added to the
file later are created. A database without seed records is adopted on its first run: existing content is recorded
and nothing is created. To let one item be seeded again, delete its record in the admin.

## Settings

`manage.py` uses `config.settings.dev`; `config/wsgi.py` uses `config.settings.prod`. To choose explicitly, set
`DJANGO_SETTINGS_MODULE` in the real environment. Setting it in `.env` has no effect, because that file is read
by the settings module after the choice has been made.

### Production

`config.settings.prod` refuses to start without a strong `DJANGO_SECRET_KEY` (50+ characters), `DJANGO_ALLOWED_HOSTS`,
and a non-default `DJANGO_ADMIN_PATH`. It turns on HTTPS redirects, secure cookies and HSTS. Deployment steps live in
[../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md). The parts the backend depends on:

| Step / setting | Why it matters |
|---|---|
| `manage.py createcachetable` (once, on first deploy) | Rate limiting and used-token tracking live in a database cache table. **Without it, every public endpoint returns a 500 error.** |
| `manage.py migrate`, `collectstatic`, `seed_content` (first deploy) | Schema, admin static files, initial content |
| `API_NUM_PROXIES` | Number of reverse proxies in front of Django (default `0`). If the host has a proxy and this stays `0`, all visitors share one rate-limit bucket: **5 inquiries per hour for the whole site**. If it is set higher than the real number, visitors can bypass limits with a fake `X-Forwarded-For` header. |
| `INQUIRY_NOTIFY_EMAIL` + `EMAIL_*` | Not enforced at start-up. If unset, inquiries are still saved, but no email is sent and each one records "Notification email not configured". |
| `INQUIRY_RETENTION_DAYS`, `INQUIRY_SPAM_RETENTION_DAYS` | Retention period from the Privacy Policy. Schedule `purge_inquiries` daily on the host (Milestone 10) |
| `DJANGO_BEHIND_TLS_PROXY` | Set to `True` only if the host terminates HTTPS in a proxy and sends `X-Forwarded-Proto` |

Check a production configuration locally (needs those variables set in the shell):
`DJANGO_SETTINGS_MODULE=config.settings.prod .venv/Scripts/python.exe manage.py check --deploy`

## Admin

- **Sign-in rate limiting:** after 5 failed sign-ins from one IP, further attempts from it are refused (HTTP 429)
  for 15 minutes after the last failure (`ADMIN_LOGIN_MAX_FAILURES`, `ADMIN_LOGIN_LOCKOUT_SECONDS`). It is counted
  per IP, so attempts from elsewhere can't lock you out. If you lock yourself out locally, wait or restart the dev
  server (the development cache is in memory).
- **Images:** the profile photo and project covers accept JPG, PNG or WebP up to 2 MB.
- **Inquiries:** submitted data is read-only. Change the status on the detail page, or select several and use the
  *Mark selected as …* actions. Inquiries can't be added by hand.

## Pages, SEO and sitemap

Every URL that isn't the API, admin, static or media is a frontend page. Django serves the built
`frontend/dist/index.html` (`FRONTEND_DIST_DIR`) with that page's title, description, canonical link, Open
Graph/Twitter tags and JSON-LD added (`apps/seo`). That's what search engines and link previews read. Unknown,
unpublished or inactive pages get a real 404 status. Run `npm run build` in `frontend/` first, otherwise pages
return 503 with a reminder.

- `/sitemap.xml` lists the public pages, published projects and active services; `/robots.txt` points to it.
- All absolute URLs use `SITE_URL`. Production refuses to start unless it is a real `https://` address.
- Page descriptions live in `apps/seo/pages.py`; projects and services use their `seo_title` / `seo_description`
  from the admin, falling back to title and summary.
- Pages carry a strict Content-Security-Policy (no inline scripts or styles); every response carries a
  Permissions-Policy (`config/security_headers.py`). If analytics are enabled, set `CSP_TRACKERS` (`google`,
  `meta`) to match the frontend's tracker IDs.
- In development, keep using the Vite server on :5173 to browse the site. Django on :8000 doesn't serve the
  built JS/CSS (production's web server does, D-008).

## API (`/api/v1/`, public)

| Endpoint | Returns |
|---|---|
| `GET site/` | Profile, social links, skills, experience, education, certifications, process steps |
| `GET projects/` | Published projects (no case-study sections) |
| `GET projects/<slug>/` | One published project with its case study |
| `GET services/` | Active services |
| `GET services/<slug>/` | One active service |
| `GET inquiries/form-token/` | Signed token for the contact form: unique, **single use**, valid 24 h by default (`INQUIRY_TOKEN_MAX_AGE_SECONDS`); not cacheable |
| `POST inquiries/` | Submit an inquiry — the only write endpoint; rate-limited, spam-filtered, saved before the owner is emailed |

### Rate limits and spam handling

| Limit | Default | Setting |
|---|---|---|
| All public endpoints, per IP | 120 requests / minute | `API_ANON_RATE` |
| `POST inquiries/`, per IP | 5 / hour, **counting every attempt**, including rejected ones (a visitor with several validation errors can be locked out for up to an hour) | `INQUIRY_RATE_LIMIT` |

Visitors are identified by their connection address (`API_NUM_PROXIES`, above). The raw IP is never stored; each
inquiry keeps a keyed hash. Submissions caught by the hidden honeypot field, or sent sooner than
`INQUIRY_MIN_SUBMIT_SECONDS` (3 s) after the token was issued, get the normal success response but are stored with
status *spam* and no email. They can be recovered in the admin. An invalid, expired or reused token returns 400 with
a `form_token` error; the contact form then fetches a new token and asks the visitor to send again.

Responses mirror `frontend/src/types/content.ts`. Facts the owner hasn't supplied are `null`, never `""`
(D-018). `apps/profiles/tests.py` checks that the API returns exactly the seeded content.

## Layout

```
backend/
├── config/            settings (base/dev/prod), urls, api_urls, wsgi
├── apps/
│   ├── profiles/      Profile (singleton), SocialLink, Skill, Experience, Education, Certification,
│   │                  /site/ endpoint, seed_content command + seed/content.json
│   ├── projects/      Project, ProjectSpec, CaseStudySection, CaseStudyPoint
│   ├── services/      Service, ProcessStep
│   ├── inquiries/     Inquiry, form token, spam checks, owner notification
│   ├── text.py        helpers for one-item-per-line fields and null-for-missing
│   └── public_api.py  read-only, AllowAny, cacheable base for public views
└── requirements/      base.txt, dev.txt, prod.txt
```
