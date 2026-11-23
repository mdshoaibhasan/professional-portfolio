# Deployment

Status: **Hosting unknown — no deployment architecture is final.** Nothing is purchased or deployed without explicit approval.

## 1. Hosting questionnaire (owner to answer)

| # | Question | Answer |
|---|---|---|
| 1 | Hosting provider (company name) | |
| 2 | Plan name/tier (shared, VPS, cloud, free tier?) | |
| 3 | Control panel (cPanel, DirectAdmin, Plesk, hPanel, none) | |
| 4 | Python app support? (cPanel "Setup Python App" / Passenger / other) | |
| 5 | Available Python versions (list all) | |
| 6 | SSH access? (yes/no; jailed?) | |
| 7 | Can you run `pip install` (and are compiled packages like Pillow allowed)? | |
| 8 | Node.js available on server? (not required — we build locally) | |
| 9 | Static file hosting / document root control? | |
| 10 | Disk space & inode limits; RAM/CPU (entry processes) limits | |
| 11 | Free SSL (Let's Encrypt / AutoSSL)? | |
| 12 | Email hosting/SMTP included? (for inquiry notifications) | |
| 13 | Cron jobs available? (for backups/cleanup) | |
| 14 | Domain status: owned? registrar? DNS managed where? | |
| 15 | Can the API live on the same domain (e.g., `example.com/api/`) or must it be a subdomain? | |
| 16 | Backups provided by host? Frequency/retention? | |
| 17 | SMTP details for inquiry notifications (host mailbox or other), and the address that should receive them | |
| 18 | Is there a reverse proxy/CDN (e.g. Cloudflare) in front of the site? (sets `API_NUM_PROXIES`) | |

Tip: in cPanel, check **Software → Setup Python App** for available versions.

## 2. Preferred architecture (if the host supports it)

- Frontend built locally → upload `frontend/dist/` as static files.
- Django via the host's Python app environment (WSGI/Passenger), same domain.
- Routes: `/api/v1/*`, admin, sitemap/robots and the SPA shell served by Django; hashed assets served statically.
- SQLite file stored **outside** the public document root; media in a dedicated directory.

## 3. Compatibility matrix (to evaluate once answers arrive)

| Host capability | Approach |
|---|---|
| cPanel + Python App (≥ 3.10) + SSH | ✅ Preferred architecture as above |
| cPanel + Python App, no SSH | Workable: upload via File Manager/Git Version Control; run `migrate`/`collectstatic` via the Python App UI "Run script"/terminal if available |
| Python < 3.10 only | ⚠️ Django 5.2 incompatible; ask host for newer Python, or choose another host / option below |
| Static hosting only (no Python) | Alternative: frontend on static host; backend on a free-tier Python host (separate subdomain, CORS) — or prerender the site and use a form-handling service (requires approval) |
| VPS | ✅ Full control: Nginx + Gunicorn + systemd (no Docker unless approved) |

## 4. Environment variables

See `/.env.example`. Production values are set in the host's environment panel or a `.env` file outside the web root —
never committed.

## 5. Release checklist (draft, finalised in M10)

1. `npm run build` (frontend) — verify output.
2. Backend tests pass; `python manage.py check --deploy` clean with prod settings.
3. Backup current database + media before upload.
4. Upload code/build; `pip install -r requirements/prod.txt` (needs Pillow — compiled package, see Q7); `migrate`;
   `createcachetable` (first deploy only); `seed_content` (first deploy only); `collectstatic`.
   Set `SITE_URL` to the real https address. The web server (or WhiteNoise, D-008) must serve the built frontend
   files (`/assets/*`, `/og-default.png`, `/favicon.svg`) **before** requests reach Django. Django's catch-all
   route would otherwise answer them with the HTML page. Django itself serves every page URL, `sitemap.xml` and
   `robots.txt` (D-038).
5. Restart the app; smoke test: home, case study, API endpoints, inquiry submit, admin login, 404 status, HTTPS redirect.
6. Rollback plan: keep previous release directory + DB backup.

## 6. Backup strategy (draft)

- Daily SQLite backup via cron using SQLite's online backup (not a raw file copy while writing), retained 14 days.
- Media directory backup weekly; off-server copy (owner's machine or free cloud storage) monthly.
- Restore procedure documented and tested once before launch.

## 7. Email

- Inquiry notifications via host SMTP (or an existing mailbox) — credentials in env only.
- SPF/DKIM/DMARC records configured for the domain to avoid spam-foldering.
