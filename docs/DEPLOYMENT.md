# Deployment

| Stage | Host | Purpose | Status |
|---|---|---|---|
| 1 | **Railway** (trial now, Free afterwards) | Temporary public demo, $0 | **Live since 2026-11-23** at https://portfolio-production-78c3b121.up.railway.app, fully verified (A4, A5) |
| 2 | **cPanel shared hosting** | Final production on a custom domain | Host not chosen; Part B |

The same code runs on both. Everything host-specific is an environment variable, apart from two small files: the
Railway scripts in `deploy/railway/` (ignored by cPanel) and `backend/passenger_wsgi.py` (ignored by Railway).
The database stays **SQLite** on both (D-043).

Nothing is purchased, upgraded, or changed in DNS without the owner's explicit approval.

---

## Part A: Railway Free (demo)

### A1. What Railway Free gives and costs

Checked in Railway's official docs on 2026-11-23. Prices and limits can change, so recheck before relying on them.

| Topic | Fact | Effect on this site |
|---|---|---|
| Cost | $0/month with **$1 of usage credit**; no card | When the $1 is used up, **the site stops until the next month** (volume data is kept) |
| Usage prices | RAM $10/GB-month, CPU $20/vCPU-month, volume $0.15/GB-month, billed per minute while awake | $1 ≈ 100 MB of RAM running all month |
| Limits | 0.5 GB RAM, 1 vCPU, 1 replica per service; 1 project, 3 services | One service, one gunicorn worker (`deploy/railway/start.sh`) |
| Sleep | Sleeps after 5–10 minutes with no outbound traffic; wakes on the next request | First visitor after a quiet spell waits for a cold start; **that request may get a 502** |
| Volume | One volume, max 0.5 GB; mounted **only while the app runs** (not during build or pre-deploy) | Database, uploads and backups live on it; migrations run at start |
| Redeploys | A service with a volume has a short downtime on every redeploy | Expected |
| Email | **Outbound SMTP is blocked** on Free (Pro and above only) | Inquiry emails aren't sent; inquiries are saved and read in the admin (A7) |
| Domain | `*.up.railway.app` only; **no custom domains** | Demo address only |
| Cron | Not available on Free | Retention clean-up runs at each start instead |
| HTTPS | Terminated by Railway; sends `X-Forwarded-Proto: https` and `X-Real-IP` | `DJANGO_BEHIND_TLS_PROXY=True`, `CLIENT_IP_HEADER=X-Real-IP` (A4) |
| Logs | Kept 3 days | |
| Config files | `railway.json`/`railway.toml` are deprecated and **stop being read on 2026-12-01** | Not used; settings are entered in the dashboard (A3) |

**Verified on the first deployment (2026-11-23):**
- Railpack installs **Python 3.12.16 and Node 22.23.4** in one service from `railpack.json`.
- Railway's proxy **overwrites** `X-Real-IP`: six requests with forged values were all counted against the real
  connection (A4 step 5).
- The volume persists across restarts: the second start found the seeded data (`skipped (seeded before)`).
- The account started on Railway's **trial** (Hobby features, $5 credit, no card), not the Free plan.
  Sleep-when-idle was switched **on** manually, because trial services are always-on by default.

- Measured usage: **64–84 MB RAM**, about 0.01 vCPU idle (estimate was 120–150 MB). Even always-on that is roughly
  $0.70–0.90 a month, inside the $1; sleep lowers it further. Check **Project → Usage** if traffic grows.

**Still to confirm:**
- Whether volume backups (A5) and `railway ssh` work on Free, and whether ssh works while the service sleeps.

### A2. What's in the repository for Railway

| File | Role |
|---|---|
| `railpack.json` | Railpack: Python 3.12 + Node 22 |
| `requirements.txt` (root) | One line, `-r backend/requirements/prod.txt`, so the builder detects Python |
| `deploy/railway/build.sh` | Build: `npm ci` + `npm run build` (frontend), `collectstatic` |
| `deploy/railway/start.sh` | Every start: refuse to run unless the database and media paths are inside the volume → back up if migrations are pending → `migrate` → `createcachetable` → `seed_content` → `purge_inquiries` → gunicorn (1 worker, 4 threads) on `$PORT` |

`seed_content` creates each item at most once and never restores deleted content (D-033). `purge_inquiries` only
deletes *closed* inquiries and spam older than the retention periods, and does nothing until those are set (D-037).

### A3. One-time setup (owner, in the Railway dashboard)

These steps need your account; I can't do them for you. Menu names may differ slightly; tell me if one isn't where
described.

1. **Sign in** at railway.com with GitHub (Free plan, no card). **New Project → Deploy from GitHub repo →**
   `mdshoaibhasan/professional-portfolio`. A first build may start and fail before the steps below are done. That's
   fine.
2. **Domain:** service → **Settings → Networking → Generate Domain**. Note the address, e.g.
   `https://portfolio-production-ab12.up.railway.app`. It's needed in step 5.
3. **Volume:** attach a volume to the service with mount path **`/data`**.
4. **Settings:**
   - Build → Custom Build Command: `sh deploy/railway/build.sh`
   - Deploy → Custom Start Command: `sh deploy/railway/start.sh`
   - **No health check.** Railway rejected `/robots.txt` as a path, and a health check would fail anyway: Railway calls
     it over plain HTTP, and Django's HTTPS redirect answers with 301, not 2xx. With a volume, redeploys have a short
     downtime regardless.
   - Replicas: 1 (volumes don't allow more). Leave Serverless (sleep) **on**: it's what keeps usage under $1.
5. **Variables** (service → Variables → Raw Editor). Replace `<domain>` with the host from step 2, without `https://`:
   ```
   DJANGO_SETTINGS_MODULE=config.settings.prod
   DJANGO_SECRET_KEY=<64+ random characters: python -c "import secrets; print(secrets.token_urlsafe(64))">
   DJANGO_ADMIN_PATH=<hard-to-guess path, e.g. manage-7f3k9q>
   DJANGO_ALLOWED_HOSTS=<domain>,healthcheck.railway.app
   DJANGO_CSRF_TRUSTED_ORIGINS=https://<domain>
   SITE_URL=https://<domain>
   DJANGO_BEHIND_TLS_PROXY=True
   CLIENT_IP_HEADER=X-Real-IP
   SQLITE_PATH=/data/db.sqlite3
   MEDIA_ROOT=/data/media
   SERVE_MEDIA=True
   SEO_ALLOW_INDEXING=False
   RAILPACK_INSTALL_CMD=python -m venv /app/.venv && /app/.venv/bin/pip install -r requirements.txt
   ```
   `RAILPACK_INSTALL_CMD` is needed because Railpack's default install copies only the root `requirements.txt`
   (for caching), so the nested `-r backend/requirements/prod.txt` is missing. The custom command runs after all
   files are copied; the Railway scripts activate `/app/.venv` themselves.
   Leave `INQUIRY_NOTIFY_EMAIL` and all `EMAIL_*` **unset**: SMTP is blocked, and an unset address makes the app skip
   sending instead of waiting for a blocked connection. Never commit or share these values.
6. **Deploy:** `railway redeploy --service portfolio --from-source --yes` deploys the latest commit on `main`. Pushes
   do **not** deploy automatically (no deploy trigger is configured), which keeps builds and credit use deliberate. Build logs should show `npm run build` and `collectstatic`. Deploy logs should show
   the migrations, `seed_content`, and gunicorn listening on the port.
7. **Admin account:** install the Railway CLI (`npm install -g @railway/cli`), then `railway login`, `railway link`
   (choose the project). `railway ssh` needs an SSH key registered with Railway, and Railway's host key in
   `known_hosts`. Done on 2026-11-23 for this computer:
   ```
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519            # no key existed before
   railway ssh keys add --key "<key comment>" --name "<label>"   # a file path was rejected; the comment works
   ssh-keyscan -t ed25519 ssh.railway.com >> ~/.ssh/known_hosts
   ```
   Railway doesn't publish its host-key fingerprint, so the key was trusted on first use and recorded:
   `ssh.railway.com ED25519 SHA256:+S1xg92FrnHz6pY3bpkmh1OGtWQGNANXilPzlxA7B1g`. If SSH ever reports a
   *changed* host key, stop and check with Railway before accepting it.

   The admin account `owner` was created non-interactively, with the password piped over stdin so it never
   appears in commands or logs. It is stored only in `~/portfolio-railway-admin.txt` on the owner's computer.
   Interactive alternative:
   ```
   railway ssh
   cd backend && python manage.py createsuperuser
   ```
   The admin is at `https://<domain>/<DJANGO_ADMIN_PATH>/`.

### A4. Verification after the first deploy

Deployment counts as successful only after these pass against the real URL. All passed on 2026-11-23.

**Results on https://portfolio-production-78c3b121.up.railway.app, 2026-11-23:** 1 ✅ (all pages 200, unknown pages and API paths 404, `/admin/` 404,
`http` → 301 `https`) · 2 ✅ (CSP, Permissions-Policy, X-Robots-Tag, HSTS, nosniff, X-Frame-Options) · 3 ✅ ·
4 ✅ (30 page views, 0 failures, Edge and Chrome; 30 placeholders, because the live database has no owner name yet)
· 5 ✅ (forged `X-Real-IP` ignored: 400 ×4, then 429, after one earlier real submission) · 6 ✅ restart persistence
(seeded data and a real inquiry submitted before the restart were both still there) · 7 ✅ admin sign-in over
HTTPS (Secure, HttpOnly session cookie); the test inquiry was stored as `new`, IP hashed, "Notification email not
configured", then deleted. The contact form was submitted
end to end in a real browser (success shown, no CSP errors).

1. Every page returns 200, unknown pages return 404, and `http://` redirects to `https://`.
2. Headers on a page: `Content-Security-Policy`, `Permissions-Policy`, `X-Robots-Tag: noindex, nofollow`,
   `Strict-Transport-Security`.
3. `/robots.txt` has no `Sitemap:` line, and pages carry `<meta name="robots" content="noindex, nofollow">`.
4. `npm run qa -- --base https://<domain>` passes (placeholders are reported, not failed).
5. **Client-IP check (security, before trusting `X-Real-IP`).** The inquiry limit is 5 per hour per visitor, and
   every attempt counts, even rejected ones. From your own connection, send six *empty* inquiry requests, each with
   a different fake `X-Real-IP`. Empty requests are rejected (400) and store nothing:
   ```
   for i in 1 2 3 4 5 6; do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<domain>/api/v1/inquiries/ \
     -H "Content-Type: application/json" -H "X-Real-IP: 203.0.113.$i" -d "{}"; done
   ```
   - **Expected:** `400` five times, then **`429`**. Railway replaced the fake header with your real IP, so all six
     counted against you. The header is safe to trust.
   - **If all six are `400`:** the fake header got through. **Remove `CLIENT_IP_HEADER` immediately** and tell me;
     the site then falls back to the proxy address (shared limits, but no spoofing).
   - Side effect: your own IP can't send an inquiry for the next hour.
6. **Persistence:** send a real test inquiry, redeploy, and confirm it's still in the admin. Then delete it.
7. **Admin lockout per visitor:** five wrong passwords lock *your* IP for 15 minutes, not everyone's.

### A5. Backups and restore

**Making a backup.** `backup_db` takes a consistent snapshot with SQLite's online-backup API, safe while the site
is running. A raw copy of the live file can be corrupt. It keeps the newest 3 (`--keep N` to change).
`start.sh` also takes one automatically before applying new migrations (keeps 5).
```
railway ssh -- sh -c "cd backend && python manage.py backup_db"
# → Backup written: /data/backups/db-20261201-093000.sqlite3 (… KB)
```

**Downloading it.** The volume is mounted at `/data`, so `/data/backups/x` is `/backups/x` inside the volume.
`--volume` must come **before** the subcommand, and is required when the CLI can't prompt:
```
railway volume files --volume portfolio-volume download /backups/db-20261201-093000.sqlite3 ./db-20261201-093000.sqlite3
```
Railway's docs also describe `scp` and `sftp` against `ssh.railway.com` (username = the service domain):
```
scp <domain>@ssh.railway.com:/data/backups/db-20261201-093000.sqlite3 .
```
Don't use `railway ssh -- cat file > local`: binary-safe output isn't documented, and it can produce a broken copy.

**Restoring.** `restore_db` checks the file is an intact Django SQLite database, saves the current data as
`pre-restore-*.sqlite3` first, restores, then applies migrations:
```
railway volume files --volume portfolio-volume upload ./db-20261201-093000.sqlite3 /backups/restore.sqlite3
railway ssh -- sh -c "cd backend && python manage.py restore_db /data/backups/restore.sqlite3 --yes"
```

**Uploaded images** (`/data/media`): download the folder with `scp -r <domain>@ssh.railway.com:/data/media ./media`.

**Railway's own volume backups** (service → Backups: manual, or daily kept 6 days). The docs don't say whether
Free includes them; if the tab is available, enable the daily schedule as an extra layer.

**Status of these commands:** verified on the live service on 2026-11-23. A backup was taken over `railway ssh`,
downloaded with `railway volume files ... download` (266,240 bytes, identical size), and checked locally (SQLite
integrity check `ok`, restore validator accepts it, expected content). It was then uploaded back and restored with
`restore_db` (safety copy kept, migrations applied, site 200, content unchanged). The `scp` route is documented by
Railway but wasn't needed.

**If the service was asleep:** open the site first to wake it before using ssh or file transfer. Right after a wake,
the first `railway ssh` command can return **nothing at all**: no output and no error, and no backup is made (seen on
2026-11-23). Run the command again; the second attempt worked. Always check for the `Backup written: …` line, and
that the file appears in `ls /data/backups`, before downloading.

On Windows Git Bash, prefix commands with `MSYS_NO_PATHCONV=1`, or `/backups/...` is rewritten into a Windows
path. Local copies are kept in `~/portfolio-backups/` (outside the repo: backups contain personal data).

**Routine:** before every deploy, run a backup and download it. Keep at least one copy off Railway.

### A6. Rollback

- **Code:** in the service's Deployments list, redeploy the previous successful deployment. The volume (data) is
  untouched by a code rollback.
- **Data:** restore the automatic pre-migration backup or your latest download (A5).
- Migrations are additive in this project, so going back one release with the same database normally works. If a
  release added a migration, restore the pre-migration backup together with the code rollback.

### A7. Inquiries without email (Railway Free)

Inquiries are saved first and are never lost because of email (save-then-notify). Each one shows
"Notification email not configured" in the admin. Check **Admin → Inquiries** regularly. Email works normally on
cPanel (Part B). Sending through an HTTPS email API such as Resend (free tier) is possible, but needs your account
and approval.

### A8. Demo caveats

- `noindex` keeps the demo out of search results. **It does not make the site private**: anyone with the link can
  open it.
- **All 20 content placeholders must be completed before the production launch** (release gate,
  [QA_REPORT.md](QA_REPORT.md) §6). The demo shows them as visible TODO boxes.
- If the monthly credit runs out, the site is offline until the next billing cycle.

### A9. Live Railway resources

Workspace "MD SHOAIB HASAN's Projects" (`ccd7b182-627e-48eb-be01-8893c67b736e`). The admin path and all secrets are
**not** recorded here; they live only in the service variables and the owner's private notes.

| Resource | Name | ID / value |
|---|---|---|
| Project | `unique-clarity` | `6af0ea04-96f8-465b-a8a2-cbce530d1b72` |
| Environment | `production` | `308dfc3e-cb41-4305-a7fc-5a90f1d5a5d3` |
| Service | `portfolio` (source: GitHub `mdshoaibhasan/professional-portfolio`, branch `main`) | `dff9c132-ebea-41b3-b059-0e04e3f35cf7` |
| Volume | `portfolio-volume`, 500 MB, mounted at `/data` | `022cb2dd-96eb-481c-bedb-6241bfe93558` |
| Domain | Railway-provided | `portfolio-production-78c3b121.up.railway.app` |

`railway volume` commands need the service and environment IDs above in non-interactive use, for example
`railway volume --service <service ID> --environment <environment ID> files --volume portfolio-volume …` (A5).

**Project cleanup (2026-11-23).** The account had two empty projects, `unique-clarity` and `zestful-upliftment`,
created about 80 seconds apart before the deployment started. The portfolio was deployed into `unique-clarity`.
`zestful-upliftment` (`97e3d22c-79e3-4e41-b6b7-2440fae7e68d`) was inspected read-only first: 0 services,
deployments, databases, volumes, domains and variables, and no link to the portfolio. Its deletion was then
requested with the owner's approval. Railway applies a **48-hour grace period**: the project shows
`deletedAt: 2026-11-25 10:42 UTC` and remains listed, and restorable from the dashboard, until then. After that, the
account has the single project the Free plan allows. The live site was checked after the request (deployment
SUCCESS, volume Ready, homepage, API and admin login 200).

---

## Part B: cPanel shared hosting (production)

### B1. Confirm with the hosting provider before buying

| # | Requirement | Why |
|---|---|---|
| 1 | **"Setup Python App"** (CloudLinux) with **Python 3.12** | Django 5.2 needs Python 3.10+; the code is tested on 3.12 (Railway) and 3.14 (local) |
| 2 | **Phusion Passenger** runs the Python app (WSGI) | Entry point `backend/passenger_wsgi.py` |
| 3 | **SSH or the cPanel Terminal** | Running `pip`, `migrate`, `createsuperuser`, backups |
| 4 | `pip install` allowed, with compiled wheels (**Pillow**) | Image uploads |
| 5 | **SQLite 3.31 or newer** on the server | Django 5.2's minimum |
| 6 | Writable folders **outside `public_html`**, kept across restarts | Database, uploads and backups must not be web-downloadable |
| 7 | **Cron jobs** | Daily backup and retention clean-up |
| 8 | **SMTP mailbox** on the domain, SPF/DKIM | Inquiry notifications |
| 9 | Free SSL (AutoSSL / Let's Encrypt) | HTTPS is required (production refuses `http://` `SITE_URL`) |
| 10 | A file outside `public_html` that only your account can read (`~/portfolio/.env`, permissions 600) | Holds the secrets for the app, the Terminal and cron alike |
| 11 | Limits: disk, inodes, RAM, entry processes | Several hundred files; small RAM footprint |
| 12 | Is Cloudflare or another proxy in front? | Decides `CLIENT_IP_HEADER` and `DJANGO_BEHIND_TLS_PROXY` |

### B2. Layout on the server

```
~/portfolio/                 code: backend/ and frontend/dist/ (no node_modules, no .venv, no db)
~/portfolio/.env             secrets and settings (chmod 600), read by Django at start-up
~/portfolio_data/db.sqlite3  database (outside public_html)
~/portfolio_data/media/      uploads
~/portfolio_data/backups/    backup_db snapshots
```

### B3. First deployment

1. **On your computer:** `cd frontend && npm ci && npm run build`. Upload the repository **without**
   `frontend/node_modules`, `backend/.venv`, `backend/db.sqlite3` or `.env`, but **with** `frontend/dist/`.
2. **cPanel → Setup Python App → Create:** Python **3.12**; application root `portfolio/backend`; application URL:
   your domain; startup file `passenger_wsgi.py`; entry point `application`.
3. **Settings file** `~/portfolio/.env` (create it with File Manager or the Terminal, then
   `chmod 600 ~/portfolio/.env`). Use this file rather than the Python App screen's variables: those reach only
   the running app, not the Terminal or cron, which would then silently use development settings.
   ```
   DJANGO_SECRET_KEY=<new 64+ random characters, not Railway's>
   DJANGO_ADMIN_PATH=<hard-to-guess path>
   DJANGO_ALLOWED_HOSTS=example.com,www.example.com
   DJANGO_CSRF_TRUSTED_ORIGINS=https://example.com,https://www.example.com
   SITE_URL=https://example.com
   SQLITE_PATH=/home/<user>/portfolio_data/db.sqlite3
   MEDIA_ROOT=/home/<user>/portfolio_data/media
   SERVE_MEDIA=True                 # simplest; or symlink media into public_html and leave this off
   SEO_ALLOW_INDEXING=True          # only once all placeholders are filled
   INQUIRY_NOTIFY_EMAIL=<where inquiries go>
   EMAIL_HOST=<mail.example.com>  EMAIL_PORT=587  EMAIL_HOST_USER=…  EMAIL_HOST_PASSWORD=…  DEFAULT_FROM_EMAIL=…
   # Only behind Cloudflare: CLIENT_IP_HEADER=CF-Connecting-IP and DJANGO_BEHIND_TLS_PROXY=True
   ```
   With no proxy, leave `CLIENT_IP_HEADER` empty: Apache passes the visitor's real address directly.
   The only variable that can't live in `.env` is `DJANGO_SETTINGS_MODULE`, because the file is read after it's
   used. Passenger needs nothing (`wsgi.py` defaults to production); shell commands export it, as below.
4. **Terminal** (cPanel shows the exact `source …/activate` line for the app):
   ```
   source /home/<user>/virtualenv/portfolio/backend/3.12/bin/activate
   export DJANGO_SETTINGS_MODULE=config.settings.prod   # manage.py would otherwise use development settings
   cd ~/portfolio/backend
   pip install -r requirements/prod.txt
   python manage.py check --deploy
   python manage.py migrate
   python manage.py createcachetable
   python manage.py collectstatic --noinput
   python manage.py seed_content
   python manage.py createsuperuser
   ```
5. **Restart** the app in Setup Python App. WhiteNoise serves `/assets/*`, `/static/*`, the preview image and the
   favicon from Django, so no Apache configuration is needed.
6. **Cron** (cPanel → Cron Jobs), daily:
   ```
   cd ~/portfolio/backend && DJANGO_SETTINGS_MODULE=config.settings.prod /home/<user>/virtualenv/portfolio/backend/3.12/bin/python manage.py backup_db --keep 14
   cd ~/portfolio/backend && DJANGO_SETTINGS_MODULE=config.settings.prod /home/<user>/virtualenv/portfolio/backend/3.12/bin/python manage.py purge_inquiries
   ```
   Copy the backups off the server regularly (cPanel File Manager → download).
7. **Verify:** the same checks as A4, against the real domain, and `npm run qa -- --release` with zero
   placeholders. For the client-IP check (A4 step 5) without a proxy, *all six* requests count against your
   connection address, so the sixth is `429` whatever the header says.

### B4. Moving the data from Railway

1. On Railway: `backup_db`, then download the file and the media folder (A5).
2. Upload them to `~/portfolio_data/` (rename the backup to `db.sqlite3`) and `~/portfolio_data/media/`.
3. Run `python manage.py migrate` and restart the app.
4. Create a **new** `DJANGO_SECRET_KEY` for cPanel. Existing admin sessions end; passwords are unaffected.

### B5. Updates and rollback

- **Release:** `backup_db` → upload the new code into a new folder (keep the previous one) → point Setup Python
  App's application root at it → `pip install`, `migrate`, `collectstatic` → restart.
- **Rollback:** point the application root back at the previous folder and restart. If the release migrated the
  database, `restore_db <backup> --yes` from the pre-release backup.

---

## Reference

### Environment variables by host

| Variable | Railway demo | cPanel production |
|---|---|---|
| `DJANGO_SETTINGS_MODULE` | `config.settings.prod` (service variable) | Passenger: not needed (`wsgi.py` defaults to prod); Terminal and cron: export it (B3) |
| `SITE_URL` | `https://<app>.up.railway.app` | `https://<your domain>` |
| `DJANGO_ALLOWED_HOSTS` | `<domain>,healthcheck.railway.app` | your domain(s) |
| `DJANGO_BEHIND_TLS_PROXY` | `True` | `False` (`True` only behind Cloudflare) |
| `CLIENT_IP_HEADER` | `X-Real-IP` (after the A4 check) | empty (Cloudflare: `CF-Connecting-IP`) |
| `SQLITE_PATH` / `MEDIA_ROOT` | `/data/...` (volume) | outside `public_html` |
| `SERVE_MEDIA` | `True` | `True`, or off with a `public_html` symlink |
| `SEO_ALLOW_INDEXING` | `False` | `True` once placeholders are done |
| `INQUIRY_NOTIFY_EMAIL`, `EMAIL_*` | unset (SMTP blocked) | set |
| `CSP_TRACKERS`, `VITE_*` IDs | unset | only if analytics are approved |

Full list with comments: [`/.env.example`](../.env.example).

### Release checklist (both hosts)

0. Release gate in [QA_REPORT.md](QA_REPORT.md) §6. For the Railway demo, placeholders are accepted (owner
   decision, 2026-11-23); for production, zero.
1. Backend: tests, ruff, `makemigrations --check`. Frontend: `npm run check` and `npm run build`.
2. **Back up the database** and download the copy.
3. Deploy (Part A or B).
4. Verify (A4).
