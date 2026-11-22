"""Local development. Never use in production."""

from .base import *  # noqa: F403
from .base import REST_FRAMEWORK, env, env_list

DEBUG = True
SECRET_KEY = env("DJANGO_SECRET_KEY") or "dev-only-insecure-key-do-not-use-in-production"
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS", "http://localhost:5173")

CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Browsable API is handy locally; production serves JSON only.
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}
