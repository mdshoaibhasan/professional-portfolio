# BackgroundBridge — Source Inspection Audit

- **Inspected:** 2026-11-23, read-only (no files in the BackgroundBridge folder were modified, no commands that write were run).
- **Source:** owner's local repository (path held privately by the owner; not recorded here).
- **Repository state:** 123 commits, 2026-08-06 → 2026-11-22, single committer (owner to confirm it is them). Branch clean except one untracked `.docx`.
- **Not opened:** `.env`, `db.sqlite3`, `backups/`, `media/`, `logs/`, `docs/samples/*.pdf` (the project's own `.gitignore` notes these sample PDFs contain real profile data). No secrets or personal records were read or copied.
- **Method:** the project's `docs/PROJECT_CONTEXT.md` was used as a map only; each claim below marked ✅ was confirmed in source (file references given). Items marked ⚠️ are documented but not independently re-verified.
- **Tests were not executed** (running them writes files in that project). Counts below are static.

> This document is an internal working file for writing the case study. Public copy is drafted from it in Milestone 4 and reviewed by the owner before publishing.

---

## 1. What it is (verified)

A **public-information people-search and reporting platform** built as a Django 5.2 monolith. A user searches by name,
username, email, phone or social URL; the system queries multiple public data sources concurrently, de-duplicates and
merges results into candidate profiles, lets the user review possible matches, and — after purchase of a report
package — produces an evidence-labelled report (web + PDF). It also contains an owner-only "Protect" area (breach /
exposure monitoring of the user's own verified emails).

**Status: not launched.** The project's own `LAUNCH_READINESS.md` (2026-11-22) states "NOT launch-ready" with open legal
blockers (US FCRA applicability, state data-broker laws, provider agreements) and independent security verification
not yet done. **The portfolio must not describe it as live, in production, or having users/customers.**

## 2. Scale (static measurement)

| Metric | Value |
|---|---|
| Application Python (excl. tests, migrations) | ~27,200 lines |
| Test code | ~19,600 lines, **1,089 test functions** (not executed in this audit) |
| Django templates | ~4,800 lines |
| Django apps | 12 packages under `apps/` (`payments` is a helper library, not an installed app; `core` holds only the custom admin site) |
| Models | 37 |
| Languages | 5 (en, es, fr, pt, bn) — `background_check/settings/base.py:290` |

Largest apps: reports (~5.7k), subscriptions (~4.3k), search (~4.1k), protection (~3.3k), api (~2.5k), providers (~2.2k).

## 3. Architecture (verified)

- **Stack:** Python, Django 5.2, DRF + SimpleJWT, server-rendered templates with HTMX + Alpine.js, Tailwind CSS 3.4,
  httpx (async), ReportLab + uharfbuzz, Stripe SDK, django-otp, argon2 (`requirements.txt`, `package.json`).
- **Settings split:** `base / development / production / container` with fail-fast production validators
  (`background_check/settings/validation.py:7,21`).
- **No Celery/Redis:** custom database-backed task queue `DBTask` with lease/lock tokens, stale-lease reclaim and
  exponential backoff (`apps/api/db_tasks.py:24,46,91-172`), driven by cron — designed for **cPanel/Passenger** hosting
  (`passenger_wsgi.py`). Also Docker Compose + Gunicorn target and GitHub Actions CI (`.github/workflows/ci.yml`:
  check, migration drift check, tests, `pip-audit`).
- **Databases:** SQLite (dev), PostgreSQL, MariaDB/MySQL (⚠️ documented in README; not traced).

## 4. Verified features (with evidence)

| # | Feature | Evidence |
|---|---|---|
| F1 | Concurrent multi-source search: async providers via `httpx.AsyncClient`, run with `asyncio.gather` | `apps/providers/base.py:90-96`, `apps/providers/registry.py:54` |
| F2 | 13 registered provider adapters: GitHub, Gravatar, Bluesky, Mastodon, Brave, Tavily, Serper, WhiteBridge, Twitter/X, Facebook; LinkedIn/Instagram/TikTok limited to official/consent-based access (*corrected 2026-11-23: earlier count of 14 included the `OfficialConsentProvider` base class*) | `apps/providers/registry.py:20-34`, `apps/providers/providers.py:271-1055` |
| F3 | Search pipeline: background job → orchestrator → merge → dedupe → rank | `apps/search/pipeline/jobs.py:15-66`, `apps/search/services/orchestrator.py:11-109` |
| F4 | Rule-based identity matching (difflib similarity, merge threshold 0.78; "possible match" links scored below threshold and never auto-merged) | `apps/ai/matching.py:3-90` |
| F5 | DB-backed job queue with leasing, retries, backoff | `apps/api/db_tasks.py` |
| F6 | Payment state machine: every change via `transition_payment()` with row locks and an audit `PaymentTransition` | `apps/subscriptions/services.py:861-973` |
| F7 | Payment providers: Stripe (signed webhook via `construct_event`), BTCPay (signature header), direct BTC; idempotent webhook processing | `apps/subscriptions/api.py:100,160`, `apps/subscriptions/webhooks.py:15-26` |
| F8 | Credit-based report packages with locked, conditional decrements | `apps/subscriptions/services.py:602-669` |
| F9 | PDF report generation (ReportLab) with bundled Noto fonts incl. **Bengali** shaping | `apps/reports/services.py:37,163-179,2692` |
| F10 | Sanctions screening against official lists (OFAC SDN, UN, EU, UK) with daily import | `apps/screening/parsers.py:46-163`, `settings/base.py:255-265` |
| F11 | Privacy: opt-out requests → keyed HMAC suppression list (no plain identifiers stored) | `apps/reports/removal.py:45-57` |
| F12 | Staff admin 2FA (TOTP + backup codes) enforced by middleware | `apps/accounts/two_factor.py:23-92`, `settings/base.py:137` |
| F13 | Login lockout per account+IP and per account | `apps/accounts/lockout.py:11-43` |
| F14 | SSRF-style outbound guard: provider redirects must stay HTTPS and never go to IPs/localhost | `apps/providers/base.py:18-74` |
| F15 | Security settings: HSTS (preload), secure/HttpOnly/SameSite cookies, nosniff, `X-Frame-Options: DENY`, COOP/COEP, referrer policy | `settings/production.py:24-29`, `settings/base.py:49-71` |
| F16 | Internationalization in 5 languages incl. Bengali | `settings/base.py:290-297`, `locale/` |
| F20 | Evidence labels Matched / Source-reported / Unverified / Derived; DB cache (`AtomicDatabaseCache`) in production, also used by rate limiting; HTMX 2.0.4 + Alpine 3.17.5 self-hosted | `apps/reports/evidence.py:144-254`, `settings/base.py:442-490`, `static/vendor/` (verified 2026-11-23) |
| F17 | Data retention purge command; privacy/data-access request flows; abuse reporting | ⚠️ files exist (`apps/api/retention.py`, `apps/reports/removal_views.py`, urls verified in `apps/reports/urls.py`); logic not traced line by line |
| F18 | Owner-only "Protect": HIBP breach checks, Gravatar exposure, Pwned Passwords k-anonymity check | ⚠️ URLs verified (`apps/protection/urls.py`); internals not traced; HIBP needs an API key |
| F19 | REST API: health, JWT auth, searches, profiles, plans, subscriptions, webhooks | `apps/api/urls.py` (routes verified; permissions per docs ⚠️) |

Not claimable: "AI" in the marketing sense. The `ai` app is **rule-based** (difflib); the optional LLM summary is off by
default and requires a self-hosted Ollama. Describe as "rule-based matching", not "AI-powered".

## 5. Suggested case-study angle

Strongest, honest narrative: **"Engineering a privacy-conscious people-search platform for constrained hosting."**

1. **Problem** — aggregating public information responsibly: accuracy, attribution, and the subject's privacy rights.
2. **Constraints** — shared cPanel hosting (no Redis/Celery/Docker in production) → custom DB task queue + DB cache.
3. **Architecture** — 12-app modular monolith, async provider layer, pipeline (collect → merge → dedupe → rank).
4. **Trust & accuracy** — evidence labels, no auto-merge of uncertain matches, sanctions screening from official lists.
5. **Security & privacy by design** — 2FA admin, lockout, SSRF guard, HMAC suppression, retention, opt-out flow.
6. **Payments** — auditable state machine across Stripe/BTCPay/BTC with idempotent webhooks.
7. **Quality** — ~1,089 tests, CI with migration drift check and dependency audit (once tests are confirmed passing).
8. **Honest status** — pre-launch; legal/compliance review identified as the gating step (this *adds* credibility).

## 6. Risks for public presentation

- **Sensitive domain.** People-search can read negatively to some recruiters. Lead with privacy/consent engineering.
- **Not launched** → no live demo link, no user/usage numbers.
- **Data exposure.** Screenshots must use dummy/seeded data only — never the local DB, sample PDFs, or real people.
- **Source visibility.** Is the repository public? If private, offer "code walkthrough on request".
- **Depth of ownership.** The repo contains several AI-assistant instruction files (`CLAUDE.md`, `CODEX_RULES.md`,
  `.github/copilot-instructions.md`). AI-assisted development is normal and fine to mention, but the case study should
  only highlight parts the owner can **explain confidently in an interview** (owner to choose — see §8).
- **Outdated README** in that repo says domain apps are "intentionally empty" — anyone viewing the repo would be misled. Fix before linking it.
- **Brand/domain:** `backgroundbridge.com` appears in config; confirm ownership before mentioning it.

## 7. Screenshots & demos

None exist (no PNG/JPG in the repo besides vendor assets). Plan (M4, with owner approval): run locally with a fresh
throwaway database and fictional data, capture landing, search progress, match review, report page, PDF page, admin
dashboard. Blur nothing real — use nothing real.

## 8. Questions for the owner

1. Confirm you are the sole developer (single committer in history).
2. Which parts can you comfortably explain in depth? (pick from F1–F19)
3. May I run the test suite in that project to confirm pass/fail? (It writes `__pycache__`/test artifacts there.)
4. Is the repo public, or can it be made public (after README fix)? Otherwise: "available on request"?
5. Is `backgroundbridge.com` registered to you?
6. Should the "Protect" module and crypto payments be featured or kept low-key?
7. New skills evidenced by this project (HTMX, Alpine.js, Tailwind CSS, Stripe API, JWT, ReportLab, async Python/httpx,
   automated testing, CI) — add to your public skills list only if you're comfortable discussing them.
