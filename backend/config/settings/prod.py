"""Production. Refuses to start with an unsafe configuration."""

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import ADMIN_PATH, ALLOWED_HOSTS, SECRET_KEY, SITE_URL, env, env_bool

DEBUG = False

if len(SECRET_KEY) < 50 or "change-me" in SECRET_KEY or SECRET_KEY.startswith("dev-only"):
    raise ImproperlyConfigured("DJANGO_SECRET_KEY must be a unique random value of at least 50 characters.")
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS must list the production host name(s).")
if ADMIN_PATH in {"", "admin"} or "change-me" in ADMIN_PATH:
    raise ImproperlyConfigured("DJANGO_ADMIN_PATH must be set to a non-default, hard-to-guess path.")
if not SITE_URL.startswith("https://") or "localhost" in SITE_URL or "127.0.0.1" in SITE_URL:
    raise ImproperlyConfigured(
        "SITE_URL must be the public https:// address of the site (no trailing slash)."
    )

# Shared across WSGI worker processes without Redis (D-009). Run `manage.py createcachetable` once.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.db.DatabaseCache",
        "LOCATION": "django_cache",
    }
}

# HTTPS. The host's proxy may terminate TLS; trust its header only when told to.
SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)
if env_bool("DJANGO_BEHIND_TLS_PROXY", False):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = int(env("DJANGO_HSTS_SECONDS", "31536000"))
# Subdomains/preload stay off until every subdomain is confirmed HTTPS-only (Milestone 10).
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("DJANGO_HSTS_INCLUDE_SUBDOMAINS", False)
SECURE_HSTS_PRELOAD = env_bool("DJANGO_HSTS_PRELOAD", False)
SILENCED_SYSTEM_CHECKS = [
    *([] if SECURE_HSTS_INCLUDE_SUBDOMAINS else ["security.W005"]),
    *([] if SECURE_HSTS_PRELOAD else ["security.W021"]),
]

EMAIL_BACKEND = env("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST")
EMAIL_PORT = int(env("EMAIL_PORT", "587"))
EMAIL_HOST_USER = env("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "webmaster@localhost")
SERVER_EMAIL = DEFAULT_FROM_EMAIL
