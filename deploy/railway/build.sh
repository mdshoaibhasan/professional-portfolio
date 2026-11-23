#!/bin/sh
# Railway build command:  sh deploy/railway/build.sh   (docs/DEPLOYMENT.md, Part A; D-043)
# Runs after Railpack has installed Python 3.12, Node 22 and requirements.txt. Needs the service variables
# (available at build time) because collectstatic loads the production settings.
set -eu
npm --prefix frontend ci
npm --prefix frontend run build
DJANGO_SETTINGS_MODULE=config.settings.prod python backend/manage.py collectstatic --noinput
