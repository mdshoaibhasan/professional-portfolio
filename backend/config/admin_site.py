"""Admin site with sign-in rate limiting (D-035).

Failed sign-ins are counted per client IP in the default cache (DatabaseCache in production, shared by all
workers). After ADMIN_LOGIN_MAX_FAILURES failures, sign-in attempts from that IP are refused until
ADMIN_LOGIN_LOCKOUT_SECONDS pass without another failure. Counting by IP, not username, means an attacker
cannot lock the owner out of their own account from elsewhere.
"""

import hashlib

from django.conf import settings
from django.contrib import admin
from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.core.cache import cache
from django.dispatch import receiver
from django.http import HttpResponse

from config.client_ip import client_ip

LOCKED_OUT_MESSAGE = (
    "<!doctype html><title>Too many attempts</title>"
    "<p>Too many failed sign-in attempts. Please wait {minutes} minutes and try again.</p>"
)


def _failure_key(request) -> str:
    # Same visitor identity as the API throttles (config/client_ip.py). Hashed: no raw IP cached.
    return "admin-login-failures:" + hashlib.sha256(client_ip(request).encode()).hexdigest()


def is_locked_out(request) -> bool:
    return cache.get(_failure_key(request), 0) >= settings.ADMIN_LOGIN_MAX_FAILURES


@receiver(user_login_failed)
def _record_failure(sender, credentials, request=None, **kwargs):
    if request is None:
        return
    key = _failure_key(request)
    # get + set rather than incr: DatabaseCache.incr resets the timeout to the cache default.
    cache.set(key, cache.get(key, 0) + 1, timeout=settings.ADMIN_LOGIN_LOCKOUT_SECONDS)


@receiver(user_logged_in)
def _clear_failures(sender, request=None, **kwargs):
    if request is not None:
        cache.delete(_failure_key(request))


class PortfolioAdminSite(admin.AdminSite):
    site_header = "Portfolio administration"
    site_title = "Portfolio admin"

    def login(self, request, extra_context=None):
        if request.method == "POST" and is_locked_out(request):
            minutes = max(1, settings.ADMIN_LOGIN_LOCKOUT_SECONDS // 60)
            return HttpResponse(LOCKED_OUT_MESSAGE.format(minutes=minutes), status=429)
        return super().login(request, extra_context)
