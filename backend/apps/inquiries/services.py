"""Form token, client fingerprinting and owner notification for inquiries."""

import hashlib
import logging
import secrets

from django.conf import settings
from django.core import signing
from django.core.cache import cache
from django.core.mail import EmailMessage
from django.utils import timezone
from django.utils.crypto import salted_hmac

from .models import Inquiry

logger = logging.getLogger(__name__)

_TOKEN_SALT = "inquiries.form-token"  # noqa: S105 — a signing namespace, not a secret


# ── Form token ─────────────────────────────────────────────────────────────
# A signed timestamp issued when the form loads. It proves the submission came from a page that fetched it
# from this origin (cross-site pages cannot read it — no CORS) and lets us reject impossibly fast submissions.
# Each token is accepted once, so a bot cannot fetch one token and replay it until the rate limit stops it.


def issue_form_token() -> str:
    # A random value makes every token unique; signing a constant would give identical tokens to visitors
    # who load the form in the same second, and single use would then reject the second visitor.
    return signing.TimestampSigner(salt=_TOKEN_SALT).sign(secrets.token_urlsafe(16))


class TokenStatus:
    VALID = "valid"
    TOO_FAST = "too_fast"
    INVALID = "invalid"  # missing, tampered with, or expired


def check_form_token(token: str) -> str:
    signer = signing.TimestampSigner(salt=_TOKEN_SALT)
    try:
        signer.unsign(token, max_age=settings.INQUIRY_TOKEN_MAX_AGE_SECONDS)
    except (signing.BadSignature, TypeError):
        return TokenStatus.INVALID
    # Old enough to be human? (unsign with max_age=minimum succeeds only if the token is *younger*.)
    try:
        signer.unsign(token, max_age=settings.INQUIRY_MIN_SUBMIT_SECONDS)
    except signing.SignatureExpired:
        return TokenStatus.VALID
    return TokenStatus.TOO_FAST


def consume_form_token(token: str) -> bool:
    """Mark a token as used. False if it was used before. The cache is shared across workers in production
    (DatabaseCache, D-009), and the entry outlives the token itself, so a used token can never pass again."""
    key = "inquiries:used-token:" + hashlib.sha256(token.encode()).hexdigest()
    return cache.add(key, 1, timeout=settings.INQUIRY_TOKEN_MAX_AGE_SECONDS + 60)


# ── Client data ────────────────────────────────────────────────────────────


def client_ip(request) -> str:
    # REMOTE_ADDR only. Trusting X-Forwarded-For is configured per host in Milestone 10.
    return request.META.get("REMOTE_ADDR", "")


def hash_ip(ip: str) -> str:
    return salted_hmac("inquiries.ip", ip, algorithm="sha256").hexdigest() if ip else ""


# ── Notification ───────────────────────────────────────────────────────────


def _notification_body(inquiry: Inquiry) -> str:
    rows = [
        ("Name", inquiry.name),
        ("Email", inquiry.email),
        ("Company", inquiry.company),
        ("WhatsApp", inquiry.whatsapp),
        ("Service", inquiry.service.title if inquiry.service else "Not specified"),
        ("Budget", inquiry.budget),
        ("Timeline", inquiry.get_timeline_display() if inquiry.timeline else ""),
    ]
    details = "\n".join(f"{label}: {value}" for label, value in rows if value)
    return f"New inquiry #{inquiry.pk}\n\n{details}\n\nMessage:\n{inquiry.message}\n"


def notify_owner(inquiry: Inquiry) -> bool:
    """Email the owner. Never raises: failures are recorded on the inquiry and logged without PII."""
    recipient = settings.INQUIRY_NOTIFY_EMAIL
    if not recipient:
        Inquiry.objects.filter(pk=inquiry.pk).update(notify_error="Notification email not configured")
        logger.warning("Inquiry %s saved; INQUIRY_NOTIFY_EMAIL is not set, no notification sent", inquiry.pk)
        return False

    subject = f"New inquiry #{inquiry.pk}" + (f" — {inquiry.service.title}" if inquiry.service else "")
    message = EmailMessage(
        subject=subject,
        body=_notification_body(inquiry),
        to=[recipient],
        reply_to=[inquiry.email],
    )
    try:
        message.send(fail_silently=False)
    except Exception as error:  # noqa: BLE001 — any mail failure must not fail the submission
        Inquiry.objects.filter(pk=inquiry.pk).update(notify_error=type(error).__name__[:200])
        logger.error("Inquiry %s saved; notification failed: %s", inquiry.pk, type(error).__name__)
        return False

    Inquiry.objects.filter(pk=inquiry.pk).update(notified_at=timezone.now(), notify_error="")
    return True
