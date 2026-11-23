"""Settings shared by every environment. Secrets and hosts come from the environment (.env.example)."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
REPO_DIR = BASE_DIR.parent

# A repo-root .env is optional; real environment variables always win.
load_dotenv(REPO_DIR / ".env", override=False)


def env(name: str, default: str = "") -> str:
    """Read a variable; unset *or empty* falls back to the default (copied .env.example files have blanks)."""
    return (os.environ.get(name) or "").strip() or default


def env_bool(name: str, default: bool = False) -> bool:
    value = env(name)
    return default if not value else value.lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in env(name, default).split(",") if item.strip()]


SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = False
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS")

INSTALLED_APPS = [
    "config.apps.PortfolioAdminConfig",  # django.contrib.admin with sign-in rate limiting
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "apps.profiles",
    "apps.projects",
    "apps.services",
    "apps.inquiries",
    "apps.seo",
    "apps.ops",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "config.security_headers.PermissionsPolicyMiddleware",
    "apps.seo.middleware.NoIndexMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

_sqlite_path = Path(env("SQLITE_PATH", "db.sqlite3"))
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": _sqlite_path if _sqlite_path.is_absolute() else BASE_DIR / _sqlite_path,
        "OPTIONS": {"timeout": 20},
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
# Where `manage.py backup_db` writes snapshots; empty = a "backups" folder next to the database (D-046).
BACKUP_DIR = env("BACKUP_DIR")
MEDIA_ROOT = Path(env("MEDIA_ROOT", str(BASE_DIR / "media")))

# Request-size limits for form data. These do NOT cap file size: images are limited in apps/uploads.py.
DATA_UPLOAD_MAX_MEMORY_SIZE = 2 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 2 * 1024 * 1024

# Public address of the site, used for canonical URLs, Open Graph tags and the sitemap (no trailing slash).
SITE_URL = env("SITE_URL", "http://localhost:5173").rstrip("/")
# False for demo deployments: every response says noindex (apps/seo/middleware.py, D-045).
SEO_ALLOW_INDEXING = env_bool("SEO_ALLOW_INDEXING", True)
# Let Django serve uploaded images when no web server does (Railway). cPanel: leave off, Apache serves media/.
SERVE_MEDIA = env_bool("SERVE_MEDIA", False)
# Built frontend (npm run build). Django serves its index.html with per-URL <head> tags (apps/seo, D-006).
FRONTEND_DIST_DIR = Path(env("FRONTEND_DIST_DIR", str(REPO_DIR / "frontend" / "dist")))

# Admin lives at a non-default path (no leading/trailing slash in the env value).
ADMIN_PATH = env("DJANGO_ADMIN_PATH", "admin").strip("/")
# Sign-in rate limiting per IP (config/admin_site.py, D-035).
ADMIN_LOGIN_MAX_FAILURES = int(env("ADMIN_LOGIN_MAX_FAILURES", "5"))
ADMIN_LOGIN_LOCKOUT_SECONDS = int(env("ADMIN_LOGIN_LOCKOUT_SECONDS", "900"))

REST_FRAMEWORK = {
    # Deny by default; public read-only views opt in explicitly.
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_THROTTLE_CLASSES": ["config.throttles.AnonThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("API_ANON_RATE", "120/minute"),
        "inquiries": env("INQUIRY_RATE_LIMIT", "5/hour"),
    },
}

# Request header holding the visitor's IP behind a reverse proxy, e.g. "X-Real-IP" on Railway; empty = use the
# connection address. Only for a proxy that overwrites the header itself (config/client_ip.py, D-044).
_ip_header = env("CLIENT_IP_HEADER").upper().replace("-", "_")
if _ip_header and not _ip_header.startswith("HTTP_"):
    _ip_header = f"HTTP_{_ip_header}"
CLIENT_IP_HEADER = _ip_header

# Contact form (apps/inquiries)
INQUIRY_NOTIFY_EMAIL = env("INQUIRY_NOTIFY_EMAIL")
INQUIRY_MIN_SUBMIT_SECONDS = int(env("INQUIRY_MIN_SUBMIT_SECONDS", "3"))
INQUIRY_TOKEN_MAX_AGE_SECONDS = int(env("INQUIRY_TOKEN_MAX_AGE_SECONDS", str(24 * 60 * 60)))
# Days to keep inquiries before `manage.py purge_inquiries` deletes them. Unset = keep everything (the owner
# has not chosen a period yet; the Privacy Policy must state the same one).
INQUIRY_RETENTION_DAYS = int(env("INQUIRY_RETENTION_DAYS")) if env("INQUIRY_RETENTION_DAYS") else None
INQUIRY_SPAM_RETENTION_DAYS = (
    int(env("INQUIRY_SPAM_RETENTION_DAYS")) if env("INQUIRY_SPAM_RETENTION_DAYS") else None
)
EMAIL_TIMEOUT = 10  # seconds; a slow mail server must not hang the request

# Security headers that apply everywhere (HTTPS-only settings live in prod.py).
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"
# Trackers the pages' Content-Security-Policy allows: "google", "meta" (config/security_headers.py).
# Must match the VITE_* tracker IDs the frontend was built with; otherwise the browser blocks those scripts.
CSP_TRACKERS = [t for t in env_list("CSP_TRACKERS") if t in {"google", "meta"}]
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"plain": {"format": "{asctime} {levelname} {name}: {message}", "style": "{"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "plain"}},
    "root": {"handlers": ["console"], "level": env("LOG_LEVEL", "INFO")},
}
