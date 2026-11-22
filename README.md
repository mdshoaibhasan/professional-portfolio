# Personal Portfolio & Freelance Website

A premium, dark-first personal portfolio and freelance services website for a Python/Django software developer —
featuring the **BackgroundBridge** case study, service pages, and a secure inquiry system.

> **Status:** Design system (Milestone 2). No application code yet.

## Tech stack (planned)

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Lucide Icons, React Hook Form, Zod, Motion |
| Backend | Python, Django (5.2 LTS proposed), Django REST Framework |
| Database | SQLite (initially) |
| Admin | Django Admin |
| Hosting | To be confirmed — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

## Repository layout

```
.
├── frontend/        React SPA (Milestone 3+)
├── backend/         Django API, admin, inquiry system (Milestone 5+)
├── docs/            Project documentation
│   ├── MASTER_PROMPT.md      Full project specification
│   ├── PLAN.md               Milestones, status, acceptance criteria
│   ├── ARCHITECTURE.md       System design, data model, API, SEO, security
│   ├── CONTENT_CHECKLIST.md  Content the owner must supply
│   ├── DEPLOYMENT.md         Hosting questionnaire and deployment strategy
│   └── DECISIONS.md          Architecture decision log
├── CLAUDE.md        Working rules for AI-assisted development
├── .env.example     Environment variable template (copy to .env; never commit .env)
└── .gitignore
```

## Getting started

Setup instructions will be added when the frontend (Milestone 3) and backend (Milestone 5) are scaffolded.

Prerequisites expected: Node.js (LTS or newer), Python matching the production host's version, Git.

## Principles

- **Truthful content only** — no invented statistics, testimonials, or skills.
- **Accessible** — WCAG 2.2 AA target, keyboard-friendly, reduced-motion aware.
- **Privacy-respecting** — analytics and ad pixels only after consent; form data never sent to ad platforms.
- **Lean** — no Docker/Redis/Celery or paid services unless explicitly approved.

## License

All rights reserved. TODO(content): confirm whether the source should be public, and choose a license if so.
