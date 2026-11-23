#!/bin/sh
# Railway start command:  sh deploy/railway/start.sh   (docs/DEPLOYMENT.md, Part A; D-043)
# Runs at every start, including waking from sleep: the volume is mounted only now (not during the build or
# the pre-deploy step), and Railway Free has no cron. Every step is safe to repeat.
set -eu
# Railpack installs the Python dependencies into /app/.venv (RAILPACK_INSTALL_CMD, docs/DEPLOYMENT.md A3).
if [ -f /app/.venv/bin/activate ]; then . /app/.venv/bin/activate; fi
cd "$(dirname "$0")/../../backend"
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings.prod}"

# Never run with the database or uploads on the container's throwaway disk.
volume="${RAILWAY_VOLUME_MOUNT_PATH:?No Railway volume is attached; the database would be lost on every deploy.}"
for name in SQLITE_PATH MEDIA_ROOT; do
  eval "value=\${$name:-}"
  case "$value" in
    "$volume"/*) ;;
    *) echo "$name must be inside the volume ($volume), got '$value'." >&2; exit 1 ;;
  esac
done
mkdir -p "$(dirname "$SQLITE_PATH")" "$MEDIA_ROOT"

# Back up before a deploy changes the schema (only when there are unapplied migrations; keeps 5).
if [ -f "$SQLITE_PATH" ] && ! python manage.py migrate --check >/dev/null 2>&1; then
  python manage.py backup_db --keep 5
fi
python manage.py migrate --noinput
python manage.py createcachetable
python manage.py seed_content      # each item at most once (SeedRecord): never overwrites or restores
python manage.py purge_inquiries   # closed inquiries and spam past retention only; no-op until configured

# One worker with threads fits the 512 MB limit; SQLite needs no more for a portfolio.
exec gunicorn config.wsgi --bind "0.0.0.0:${PORT:-8000}" --workers 1 --threads 4 --timeout 60 \
  --access-logfile - --error-logfile -
