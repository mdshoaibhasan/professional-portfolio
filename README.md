# Professional Portfolio

Source code for my personal portfolio and freelance website. I'm a Software Engineer, and the site presents my
selected projects, the services I offer, and a contact form that handles inquiries securely.

> **Status:** in development, not yet deployed. Milestones 1–6 are complete (planning, design system, frontend,
> public pages, content API, contact system). Admin, SEO, QA and deployment are next. Progress:
> [docs/PLAN.md](docs/PLAN.md).

## What it does

- **Public website:** home, projects with case studies, services (software development first, digital marketing
  as a separate secondary category), about, experience, contact, privacy policy and a custom 404 page.
- **Content API:** all site content lives in the database and is served read-only under `/api/v1/`. The site
  owner edits it in Django Admin; nothing is hard-coded into the frontend build.
- **Contact system:** each inquiry is validated on both client and server and saved *before* the owner is emailed,
  so a mail failure never loses a message. Spam is filtered with a honeypot field, a minimum fill time and a signed
  single-use form token, plus per-IP rate limiting. Saved inquiries keep only a keyed hash of the sender's IP.
- **Honest content by design:** facts not yet supplied are `null` in the API and show as visible placeholders, so
  nothing invented can ship. Skills are shown as *used*, *currently learning* or *interested in*, and never as
  percentage bars.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 6 (strict), Vite 8, Tailwind CSS 4, React Router 8, React Hook Form + Zod, Lucide icons |
| Backend | Python, Django 5.2 LTS, Django REST Framework 3.18 |
| Database | SQLite |
| Testing | Django test runner (backend), Vitest + Testing Library (frontend), ruff, ESLint, Prettier |
| Hosting | Not chosen yet: see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

There's no Docker, Redis, Celery or paid service. Rate limiting uses Django's database cache, so the site can run on
ordinary shared hosting.

## Running it locally

You'll need Node.js 22.22 or newer, Python 3.10 or newer, and Git. The commands below are for Git Bash on Windows.
On macOS or Linux, use `.venv/bin/...` instead of `.venv/Scripts/...exe`.

**Backend** (terminal 1):

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements/dev.txt
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py seed_content     # initial content
.venv/Scripts/python.exe manage.py createsuperuser  # admin login
.venv/Scripts/python.exe manage.py runserver        # http://127.0.0.1:8000
```

**Frontend** (terminal 2):

```bash
cd frontend
npm install
npm run dev                                         # http://localhost:5173
```

Open **http://localhost:5173**. Vite forwards `/api` requests to Django, so the browser only talks to one origin.
In development the admin is at http://127.0.0.1:8000/admin/. Configuration is optional locally: copy
[.env.example](.env.example) to `.env` in the repository root to override defaults.

More detail is in [backend/README.md](backend/README.md) (settings, production checklist, rate limits) and
[frontend/README.md](frontend/README.md).

## Checks

Both must pass before every commit:

```bash
cd frontend && npm run check      # type-check, lint, formatting, tests
cd backend && .venv/Scripts/ruff.exe check . && .venv/Scripts/ruff.exe format --check . \
  && .venv/Scripts/python.exe manage.py test
```

## Repository layout

```
.
├── frontend/   React single-page app: pages, components, contact form
├── backend/    Django API, admin, inquiry system, seed content
├── docs/       Specification, plan, architecture, decisions, design system, content checklist
├── CLAUDE.md   Working rules for AI-assisted development in this repo
└── .env.example
```

Key documents: [ARCHITECTURE.md](docs/ARCHITECTURE.md) (system design, API, security),
[DECISIONS.md](docs/DECISIONS.md) (decision log), [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) (visual language),
[POSITIONING.md](docs/POSITIONING.md) (content direction).

## Principles

- **Truthful content only:** no invented statistics, testimonials, clients or skills.
- **Accessible:** targets WCAG 2.2 AA, with keyboard navigation, visible focus and support for reduced motion.
- **Privacy-respecting:** no third-party requests before consent, and form data is never sent to ad platforms.
- **Lean:** no new dependency without a recorded reason.

## License

All rights reserved. TODO(content): confirm whether the source should be public, and choose a license if so.
