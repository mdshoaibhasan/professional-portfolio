import time
from smtplib import SMTPException
from unittest import mock

from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils.crypto import salted_hmac

from apps.services.models import Service

from .models import Inquiry
from .services import issue_form_token

URL = "/api/v1/inquiries/"
TOKEN_URL = "/api/v1/inquiries/form-token/"  # noqa: S105 — a URL, not a secret


def valid_payload(**overrides) -> dict:
    payload = {
        "name": "Test Client",
        "email": "client@example.com",
        "company": "Example Ltd",
        "whatsapp": "+880 1700 000000",
        "service": "web-application-development",
        "message": "We need a Django API for our inventory system.",
        "budget": "To be discussed",
        "timeline": "1-3-months",
        "form_token": issue_form_token(),
        "website": "",
    }
    payload.update(overrides)
    return payload


@override_settings(INQUIRY_MIN_SUBMIT_SECONDS=0, INQUIRY_NOTIFY_EMAIL="owner@example.com")
class InquiryApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        Service.objects.create(
            slug="web-application-development",
            title="Web Application Development",
            tier=Service.Tier.PRIMARY,
            summary="s",
            description="d",
            ideal_for="i",
            includes="x",
        )
        Service.objects.create(
            slug="retired",
            title="Retired",
            tier=Service.Tier.PRIMARY,
            summary="s",
            description="d",
            ideal_for="i",
            includes="x",
            is_active=False,
        )

    def setUp(self):
        cache.clear()  # throttle history lives in the cache

    def post(self, payload, **extra):
        return self.client.post(URL, payload, content_type="application/json", **extra)

    # ── Happy path ──────────────────────────────────────────────────────────

    def test_valid_inquiry_is_saved_then_owner_notified(self):
        response = self.post(valid_payload(), REMOTE_ADDR="203.0.113.7")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(set(response.json()), {"detail"})  # no submitted data echoed back

        inquiry = Inquiry.objects.get()
        self.assertEqual(inquiry.status, Inquiry.Status.NEW)
        self.assertEqual(inquiry.service.slug, "web-application-development")
        self.assertIsNotNone(inquiry.notified_at)
        self.assertEqual(
            inquiry.ip_hash, salted_hmac("inquiries.ip", "203.0.113.7", algorithm="sha256").hexdigest()
        )
        self.assertNotIn("203.0.113.7", inquiry.ip_hash)

        [email] = mail.outbox
        self.assertEqual(email.to, ["owner@example.com"])
        self.assertEqual(email.reply_to, ["client@example.com"])
        self.assertIn("We need a Django API", email.body)
        self.assertIn("Web Application Development", email.subject)

    def test_only_required_fields(self):
        payload = {
            "name": "Al",
            "email": "a@example.com",
            "message": "x" * 20,
            "form_token": issue_form_token(),
        }
        self.assertEqual(self.post(payload).status_code, 201)
        inquiry = Inquiry.objects.get()
        self.assertIsNone(inquiry.service)
        self.assertEqual(inquiry.company, "")

    def test_token_endpoint_is_not_cacheable(self):
        response = self.client.get(TOKEN_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "no-store")
        self.assertTrue(response.json()["token"])

    # ── Notification failure must not fail the submission ──────────────────

    def test_email_failure_still_returns_success_and_keeps_inquiry(self):
        with mock.patch("django.core.mail.EmailMessage.send", side_effect=SMTPException("down")):
            response = self.post(valid_payload())
        self.assertEqual(response.status_code, 201)
        inquiry = Inquiry.objects.get()
        self.assertIsNone(inquiry.notified_at)
        self.assertEqual(inquiry.notify_error, "SMTPException")

    @override_settings(INQUIRY_NOTIFY_EMAIL="")
    def test_missing_notification_address_still_saves(self):
        self.assertEqual(self.post(valid_payload()).status_code, 201)
        self.assertEqual(Inquiry.objects.get().notify_error, "Notification email not configured")
        self.assertEqual(mail.outbox, [])

    # ── Validation ─────────────────────────────────────────────────────────

    def test_validation_errors_are_reported_per_field(self):
        response = self.post(
            valid_payload(
                name="A",
                email="not-an-email",
                message="too short",
                whatsapp="call me",
                service="retired",
                timeline="yesterday",
            )
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            set(response.json()), {"name", "email", "message", "whatsapp", "service", "timeline"}
        )
        self.assertFalse(Inquiry.objects.exists())

    def test_header_injection_in_name_is_rejected(self):
        response = self.post(valid_payload(name="Eve\nBcc: victim@example.com"))
        self.assertEqual(response.status_code, 400)
        self.assertIn("name", response.json())

    def test_oversized_message_rejected(self):
        self.assertEqual(self.post(valid_payload(message="x" * 5001)).status_code, 400)

    # ── Spam protection ─────────────────────────────────────────────────────

    def test_honeypot_looks_successful_but_is_stored_as_spam_without_email(self):
        response = self.post(valid_payload(website="https://spam.example"))
        self.assertEqual(response.status_code, 201)
        inquiry = Inquiry.objects.get()
        self.assertEqual((inquiry.status, inquiry.spam_reason), (Inquiry.Status.SPAM, "honeypot"))
        self.assertEqual(mail.outbox, [])

    @override_settings(INQUIRY_MIN_SUBMIT_SECONDS=60)
    def test_instant_submission_is_stored_as_spam(self):
        response = self.post(valid_payload())
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Inquiry.objects.get().spam_reason, "too_fast")
        self.assertEqual(mail.outbox, [])

    def test_missing_or_tampered_token_is_rejected(self):
        for token in ["", "garbage", issue_form_token() + "x"]:
            response = self.post(valid_payload(form_token=token))
            self.assertEqual(response.status_code, 400, token)
            self.assertIn("form_token", response.json())
        self.assertFalse(Inquiry.objects.exists())

    def test_expired_token_is_rejected(self):
        with mock.patch("django.core.signing.time.time", return_value=time.time() - 2 * 24 * 3600):
            old_token = issue_form_token()
        response = self.post(valid_payload(form_token=old_token))
        self.assertEqual(response.status_code, 400)
        self.assertIn("expired", response.json()["form_token"][0])

    def test_token_is_single_use(self):
        token = issue_form_token()
        self.assertEqual(self.post(valid_payload(form_token=token)).status_code, 201)
        replay = self.post(valid_payload(form_token=token, message="A second message, same token."))
        self.assertEqual(replay.status_code, 400)
        self.assertIn("form_token", replay.json())
        self.assertEqual(Inquiry.objects.count(), 1)

    def test_spam_submission_also_uses_up_the_token(self):
        token = issue_form_token()
        self.assertEqual(self.post(valid_payload(form_token=token, website="x")).status_code, 201)
        self.assertEqual(self.post(valid_payload(form_token=token)).status_code, 400)

    def test_field_errors_do_not_use_up_the_token(self):
        token = issue_form_token()
        self.assertEqual(self.post(valid_payload(form_token=token, email="nope")).status_code, 400)
        self.assertEqual(self.post(valid_payload(form_token=token)).status_code, 201)

    def test_tokens_issued_in_the_same_second_differ(self):
        with mock.patch("django.core.signing.time.time", return_value=1_800_000_000):
            self.assertNotEqual(issue_form_token(), issue_form_token())

    # ── Rate limiting ──────────────────────────────────────────────────────

    def test_rate_limit_ignores_spoofed_forwarded_for(self):
        with mock.patch(
            "rest_framework.throttling.ScopedRateThrottle.THROTTLE_RATES",
            {"inquiries": "2/hour", "anon": "1000/minute"},
        ):
            codes = [
                self.post(
                    valid_payload(), REMOTE_ADDR="198.51.100.1", HTTP_X_FORWARDED_FOR=f"10.0.0.{i}"
                ).status_code
                for i in range(3)
            ]
        self.assertEqual(codes, [201, 201, 429])

    @override_settings(CLIENT_IP_HEADER="HTTP_X_REAL_IP")
    def test_behind_a_proxy_each_visitor_gets_their_own_limit(self):
        with mock.patch(
            "rest_framework.throttling.ScopedRateThrottle.THROTTLE_RATES",
            {"inquiries": "1/hour", "anon": "1000/minute"},
        ):
            proxy = {"REMOTE_ADDR": "10.0.0.1"}  # every request arrives from the proxy
            first = self.post(valid_payload(), HTTP_X_REAL_IP="203.0.113.1", **proxy).status_code
            second = self.post(valid_payload(), HTTP_X_REAL_IP="203.0.113.2", **proxy).status_code
            repeat = self.post(valid_payload(), HTTP_X_REAL_IP="203.0.113.1", **proxy).status_code
        self.assertEqual((first, second, repeat), (201, 201, 429))
        hashes = set(Inquiry.objects.values_list("ip_hash", flat=True))
        self.assertEqual(len(hashes), 2)  # hashed per visitor, not per proxy

    # ── Method & privacy hygiene ───────────────────────────────────────────

    def test_only_post_is_allowed(self):
        self.assertEqual(self.client.get(URL).status_code, 405)
        self.assertEqual(self.client.post(TOKEN_URL).status_code, 405)

    def test_logs_contain_no_personal_data(self):
        with mock.patch("django.core.mail.EmailMessage.send", side_effect=SMTPException("down")):
            with self.assertLogs("apps.inquiries", level="INFO") as logs:
                self.post(valid_payload())
                self.post(valid_payload(website="bot"))
        output = "\n".join(logs.output)
        for secret in ["client@example.com", "Test Client", "+880", "inventory"]:
            self.assertNotIn(secret, output)
