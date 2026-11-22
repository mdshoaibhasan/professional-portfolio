# CLAUDE.md — Project Instructions

Instructions for any AI assistant (and human contributor) working in this repository.
Read this file fully before making changes. Full specification: [docs/MASTER_PROMPT.md](docs/MASTER_PROMPT.md).

---

## 1. Project in one paragraph

A premium, production-ready personal portfolio and freelance website for a Computer Science & Engineering
student/software developer based in Bangladesh. Primary identity: **Software Developer (Python / Django / DRF)**.
Secondary: freelance services (web, API, mobile, social media management/advertising).
The flagship case study is **BackgroundBridge**, a Python/Django project whose claims must be verified from source code.

## 2. Current status

| Item | Status |
|---|---|
| Current milestone | **Milestone 6 — Contact System (in progress, approved 2026-11-23)** |
| Next milestone | Milestone 7 — Admin & Content Management (**not approved yet**) |
| Hosting | Unknown — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| BackgroundBridge source | Inspected read-only 2026-11-23 → [docs/BACKGROUNDBRIDGE_AUDIT.md](docs/BACKGROUNDBRIDGE_AUDIT.md). Pre-launch; never describe it as live. |

Update this table whenever a milestone changes state. Progress detail lives in [docs/PLAN.md](docs/PLAN.md).

## 3. Non-negotiable working rules

1. **One milestone at a time.** Never start a milestone without explicit user approval. Stop at each approval gate.
2. **Inspect before changing.** Read files/dirs before editing. Never overwrite or delete existing work without permission.
3. **Plan before implementing.** Non-trivial changes get a short plan first.
4. **No unapproved dependencies.** Every new package must be justified; list it in [docs/DECISIONS.md](docs/DECISIONS.md).
   Docker, Redis, Celery, microservices, and paid services are **forbidden** unless the user explicitly approves.
5. **Verify before claiming.** Run builds/tests/linters before saying something works. Report failures honestly.
6. **No secrets in git.** Never commit `.env`, databases, `media/`, credentials, or private files. Check `git status` before every commit.
7. **Git:** commit only when asked or at an approved milestone checkpoint. **Never push, merge, or deploy without approval.**
8. **No purchases, no paid ads, no deployments** without explicit approval.
9. **Keep docs current.** Update PLAN.md (status), DECISIONS.md (new decisions), CONTENT_CHECKLIST.md (content received) as part of each change.

## 4. Content integrity rules (critical)

- Use **only verified information** about the owner. Never invent: dates, employers, qualifications, client counts,
  statistics, testimonials, revenue, achievements, skills, project features, company names, or partnerships.
- Missing content → set the field to `null` in `frontend/src/content/*` (rendered by `<Fact>` / `<Todo>` as a visible
  placeholder), or use a `TODO(content): <what is needed>` comment, and make sure it is listed in
  [docs/CONTENT_CHECKLIST.md](docs/CONTENT_CHECKLIST.md). Placeholders must never ship to production (QA checks for `TODO(content)`).
- **No** fake skill percentage bars, fake metrics, fake testimonials, or fake logos.
- Skill levels must match reality: Flutter/Dart and Linux are **basic**. Do not upgrade them in copy.
- Software development is the primary identity; marketing/social services are secondary and must look secondary.
- **BackgroundBridge:** every technical claim must trace to inspected source code (file paths recorded in the case-study
  notes). A name in a README or a model/URL stub is **not** proof a feature works. Never reproduce secrets, credentials,
  private data, or sensitive records from that codebase.
- Privacy: do not publish the owner's home address, personal phone number, date of birth, NID, or similar
  unless the user explicitly provides it **for publication**.

## 5. Architecture summary

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detail.

```
personal-portfolio/
├── frontend/   React + TypeScript + Vite + Tailwind CSS (SPA, built locally to static files)   [Milestone 3+]
├── backend/    Django + Django REST Framework + SQLite (API, admin, inquiries, SEO shell)      [Milestone 5+]
└── docs/       Specification, plan, architecture, decisions, content checklist, deployment
```

- Frontend: React, TypeScript (strict), Vite, Tailwind CSS, React Router, Lucide, React Hook Form, Zod, Motion (sparingly).
- Backend: Django 5.2 LTS, DRF, SQLite. Apps: `profiles`, `projects`, `services` (+ `inquiries` in Milestone 6). Site content lives in the database (seeded from `backend/apps/profiles/seed/content.json`) and reaches the frontend through route loaders.
- API under `/api/v1/`. Django Admin at a non-default path. Same-domain deployment preferred.

## 6. Coding conventions

### General
- Small, focused modules. Clear names over comments. Comments explain *why*, not *what*.
- No dead code, no commented-out blocks, no speculative abstractions.
- Line endings LF; UTF-8; 2-space indent for TS/CSS/JSON, 4-space for Python.

### Frontend (from Milestone 3)
- TypeScript `strict: true`. No `any` without a justification comment.
- Components: `PascalCase.tsx`; hooks: `useThing.ts`; one component per file for non-trivial components.
- Styling with Tailwind utilities driven by design tokens (no ad-hoc hex values in components).
- Accessibility: semantic HTML first, visible focus states, labelled form controls, alt text, keyboard navigation,
  WCAG 2.2 AA contrast minimum. Respect `prefers-reduced-motion` for every animation.
- Animations are subtle and purposeful; never block content or delay LCP.
- Forms: React Hook Form + Zod; client validation mirrors (never replaces) server validation.
- Self-host fonts; no third-party requests before consent (fonts, analytics, pixels).

### Backend (from Milestone 5)
- Settings split: `base.py`, `dev.py`, `prod.py`; all secrets from environment variables (see `.env.example`).
- `DEBUG=False` in production; strict `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, secure cookies, HSTS once HTTPS confirmed.
- Public API is read-only except the inquiry endpoint. Validate with DRF serializers; never trust client input.
- Inquiries: **save first**, then attempt email notification; email failure is logged, never surfaced as a submission failure.
- Format with `ruff format`; lint with `ruff` (proposed for M5 — dev-only dependency).

### Testing
- Backend: Django test runner / pytest-django (decide in M5), covering models, serializers, inquiry flow, throttling.
- Frontend: type-check + lint + production build must pass; component tests where logic exists.
- Before claiming done: run the relevant checks and report their actual output.

## 7. Commands

Frontend (run inside `frontend/`, details in [frontend/README.md](frontend/README.md)):
- `npm run dev` — dev server on :5173 · `npm run build` — production build · `npm run preview` — serve the build
- `npm run check` — type-check + lint + Prettier check (**must pass before any commit**)

Backend (run inside `backend/`, details in [backend/README.md](backend/README.md)):
- `.venv/Scripts/python.exe manage.py runserver` — API on :8000 · `manage.py test` — test suite
- `.venv/Scripts/ruff.exe check . && .venv/Scripts/ruff.exe format --check .` — lint/format (**must pass before any commit**)
- `manage.py seed_content` — initial content (never overwrites admin edits)

## 8. Local environment (observed 2026-11-23)

- Windows 11, Git 2.52, Python 3.14.3, Node 26.13.1, npm 11.20.
- The **production Python version may differ** — once hosting is known, develop the backend in a virtualenv using the
  host's Python version.

## 9. Commit checklist

1. `git status` — inspect every staged file.
2. Confirm no `.env`, `*.sqlite3`, `media/`, keys, or personal documents are staged.
3. Build/tests pass for the touched area.
4. Docs updated (PLAN status, DECISIONS, CONTENT_CHECKLIST).
5. Clear commit message describing *why*.
