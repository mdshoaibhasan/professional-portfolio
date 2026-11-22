import type { ProjectDetail } from "@/types/content";

/**
 * Only facts verified in docs/BACKGROUNDBRIDGE_AUDIT.md may appear here (F-numbers reference its §4).
 * BackgroundBridge is pre-launch: never describe it as live, launched or having users.
 * Held back until the owner answers audit §8: crypto payment details, the "Protect" module,
 * the automated test count (not yet run), and the repository link.
 */
export const projects: ProjectDetail[] = [
  {
    slug: "backgroundbridge",
    title: "BackgroundBridge",
    summary:
      "A privacy-conscious public-information search and reporting platform, engineered for shared hosting.",
    status: "pre-launch",
    is_featured: true,
    technologies: ["Python", "Django", "Django REST Framework", "httpx (async)", "ReportLab"],
    role: null, // audit §8 Q1
    period: "2026",
    repo_url: null, // audit §8 Q4
    live_url: null, // pre-launch: no public demo
    specs: [
      { label: "Stack", value: "Django 5.2 · DRF · async httpx · ReportLab · HTMX" },
      { label: "Scope", value: "12 Django app packages · 37 data models" },
      { label: "Hosting", value: "Designed for shared cPanel hosting" },
      { label: "Role", value: null },
    ],
    highlights: [
      "Concurrent multi-source search",
      "Audited payment state machine",
      "Privacy by design",
    ],
    sections: [
      {
        id: "overview",
        title: "Overview",
        body: [
          "BackgroundBridge lets a user search by name, username, email, phone number or social profile link, review the possible matches, and receive a report — on screen and as a PDF — in which every finding is labelled with where it came from.",
          "The project is pre-launch. Its own launch-readiness review identified legal and compliance questions that must be resolved before it can go live, and I treat that as part of the engineering work rather than an afterthought.",
        ],
        points: [],
      },
      {
        id: "problem",
        title: "The problem",
        body: [
          "Public information about a person is scattered across many platforms, and naïve aggregation creates two risks: wrong matches presented as facts, and disregard for the privacy of the people being searched. The platform had to be accurate about what it knows, honest about what it doesn't, and respectful of people who ask to be removed.",
        ],
        points: [],
      },
      {
        id: "constraints",
        title: "Constraints",
        body: [
          "The target environment was shared cPanel hosting — no Redis, no Celery, no Docker in production, and only cron for scheduled work.",
        ],
        points: [
          {
            title: "Database-backed job queue",
            // F5 — apps/api/db_tasks.py
            text: "Background work runs from a task table with leased locks, stale-lease recovery and exponential back-off, processed by a cron-driven worker.",
          },
          {
            title: "Database cache",
            text: "Caching and rate limiting use Django's database cache, so they work across hosting worker processes without extra services.",
          },
        ],
      },
      {
        id: "architecture",
        title: "Architecture",
        body: [
          "A modular Django monolith of 12 app packages and 37 data models, with server-rendered templates enhanced by HTMX and Alpine.js, and a REST API built with Django REST Framework.",
        ],
        points: [
          {
            title: "Asynchronous provider layer",
            // F1, F2
            text: "Thirteen source adapters run concurrently with httpx and asyncio, so one slow source does not hold up the others. Platforms without an open API are limited to official, consent-based access.",
          },
          {
            title: "Search pipeline",
            // F3
            text: "Results flow through collect → merge → de-duplicate → rank stages before candidates are shown.",
          },
          {
            title: "Environment-specific settings",
            text: "Separate development and production settings, with production refusing to start if security-critical configuration is missing.",
          },
        ],
      },
      {
        id: "accuracy",
        title: "Accuracy & trust",
        body: [],
        points: [
          {
            title: "No silent merging",
            // F4
            text: "Rule-based similarity matching only merges records above a fixed threshold. Weaker links are shown as possible matches for the user to confirm or reject — never merged automatically.",
          },
          {
            title: "Labelled evidence",
            // F20
            text: "Each finding carries an evidence label — matched, source-reported, unverified or derived — and its source, so readers can see what was confirmed and what was not.",
          },
          {
            title: "Official sanctions screening",
            // F10
            text: "Names are screened against the official sanctions lists published by the US, UN, EU and UK, imported by a dedicated command designed to run daily.",
          },
        ],
      },
      {
        id: "security",
        title: "Security & privacy by design",
        body: [],
        points: [
          {
            title: "Protected administration",
            // F12, F13
            text: "Staff access to the admin requires a time-based second factor, and repeated failed sign-ins lock the account.",
          },
          {
            title: "Safe outbound requests",
            // F14
            text: "Requests to external sources may only follow HTTPS redirects and can never be redirected to internal addresses.",
          },
          {
            title: "Removal requests that stick",
            // F11
            text: "People can request removal. Approved removals go into a suppression list that stores keyed hashes rather than the original identifiers, and suppressed profiles are excluded from future results.",
          },
          {
            title: "Hardened defaults",
            // F15
            text: "HTTPS enforcement with HSTS, secure cookies, and strict framing and cross-origin policies.",
          },
        ],
      },
      {
        id: "payments",
        title: "Payments & reports",
        body: [],
        points: [
          {
            title: "Auditable payment state machine",
            // F6, F7, F8
            text: "Every payment status change goes through a single function that locks the record and writes an audit entry. Webhooks are signature-verified and processed exactly once, and report credits are deducted with locked, conditional updates.",
          },
          {
            title: "Multilingual PDF reports",
            // F9, F16
            text: "Reports are generated as PDFs with bundled fonts, including correct Bengali text shaping, and the interface is available in five languages.",
          },
        ],
      },
      {
        id: "quality",
        title: "Quality",
        body: [
          "The project includes an automated test suite, and continuous integration runs Django's system checks, a check for missing database migrations, the tests, and a dependency vulnerability audit on every push.",
        ],
        points: [],
      },
      {
        id: "status",
        title: "Status & next steps",
        body: [
          "BackgroundBridge is not live. The remaining work before launch is a legal and compliance review for the markets it would serve, followed by independent security verification.",
        ],
        points: [],
      },
    ],
  },
  // CONTENT_CHECKLIST E — other projects to be added once the owner provides them.
];

export function findProject(slug: string | undefined): ProjectDetail | undefined {
  return projects.find((project) => project.slug === slug);
}
