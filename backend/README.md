# backend/

Django 5.2 LTS + Django REST Framework: the public content API and Django Admin.
The inquiry system arrives in Milestone 6. See [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) §3.

## Setup (Windows, Git Bash)

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements/dev.txt
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py seed_content      # initial content; safe to re-run
.venv/Scripts/python.exe manage.py createsuperuser   # for the admin
.venv/Scripts/python.exe manage.py runserver         # http://127.0.0.1:8000
```

Run the frontend (`cd frontend && npm run dev`) alongside it: Vite proxies `/api` to Django, so the browser
only ever talks to one origin.

## Commands

| Command | What it does |
|---|---|
| `manage.py test` | Run the test suite |
| `ruff check . && ruff format --check .` | Lint and formatting check (via `.venv/Scripts/ruff.exe`) |
| `manage.py seed_content` | Load initial content from `apps/profiles/seed/content.json`. Only fills empty tables and creates missing slugs — never overwrites admin edits |
| `manage.py makemigrations --check --dry-run` | Confirm no model change is missing a migration |

Settings default to `config.settings.dev`. Production uses `config.settings.prod`, which refuses to start
without a strong `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` and a non-default `DJANGO_ADMIN_PATH`.

## API (`/api/v1/`, read-only, public)

| Endpoint | Returns |
|---|---|
| `GET site/` | Profile, social links, skills, experience, education, certifications, process steps |
| `GET projects/` | Published projects (no case-study sections) |
| `GET projects/<slug>/` | One published project with its case study |
| `GET services/` | Active services |
| `GET services/<slug>/` | One active service |

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
│   ├── text.py        helpers for one-item-per-line fields and null-for-missing
│   └── public_api.py  read-only, AllowAny, cacheable base for public views
└── requirements/      base.txt, dev.txt, prod.txt
```
