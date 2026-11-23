#!/bin/sh
# Railway build command:  sh deploy/railway/build.sh   (docs/DEPLOYMENT.md, Part A; D-043)
# Runs after Railpack has installed Python 3.12, Node 22 and requirements.txt. Needs the service variables
# (available at build time) because collectstatic loads the production settings.
set -eu
# Railpack installs the Python dependencies into /app/.venv (RAILPACK_INSTALL_CMD, docs/DEPLOYMENT.md A3).
if [ -f /app/.venv/bin/activate ]; then . /app/.venv/bin/activate; fi
npm --prefix frontend ci
npm --prefix frontend run build
DJANGO_SETTINGS_MODULE=config.settings.prod python backend/manage.py collectstatic --noinput
