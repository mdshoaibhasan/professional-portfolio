"""Milestone 7: admin hardening and content management."""

from datetime import timedelta
from io import StringIO

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from apps.inquiries.models import Inquiry
from apps.profiles.models import Profile
from apps.projects.models import Project
from config.admin_site import PortfolioAdminSite

PASSWORD = "a-long-test-password-123"  # noqa: S105 — test fixture

# Smallest valid PNG (1×1 pixel).
PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082"
)


def make_superuser():
    return get_user_model().objects.create_superuser("owner", "owner@example.com", PASSWORD)


class AdminLoginRateLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        make_superuser()
        self.url = reverse("admin:login")

    def attempt(self, password, ip="198.51.100.10"):
        return self.client.post(self.url, {"username": "owner", "password": password}, REMOTE_ADDR=ip)

    def test_admin_uses_the_hardened_site(self):
        self.assertIsInstance(admin.site, PortfolioAdminSite)

    @override_settings(ADMIN_LOGIN_MAX_FAILURES=3)
    def test_repeated_failures_lock_out_even_the_right_password(self):
        for _ in range(3):
            self.assertEqual(self.attempt("wrong").status_code, 200)  # form re-shown with an error
        response = self.attempt(PASSWORD)
        self.assertEqual(response.status_code, 429)
        self.assertNotIn("_auth_user_id", self.client.session)

    @override_settings(ADMIN_LOGIN_MAX_FAILURES=3)
    def test_lockout_is_per_ip_so_the_owner_is_not_locked_out_elsewhere(self):
        for _ in range(3):
            self.attempt("wrong", ip="203.0.113.66")
        self.assertEqual(self.attempt(PASSWORD, ip="198.51.100.10").status_code, 302)

    @override_settings(ADMIN_LOGIN_MAX_FAILURES=3)
    def test_successful_sign_in_resets_the_count(self):
        self.attempt("wrong")
        self.attempt("wrong")
        self.assertEqual(self.attempt(PASSWORD).status_code, 302)
        self.client.logout()
        self.attempt("wrong")
        self.attempt("wrong")
        self.assertEqual(self.attempt(PASSWORD).status_code, 302)

    def test_login_page_itself_is_never_blocked(self):
        with override_settings(ADMIN_LOGIN_MAX_FAILURES=1):
            self.attempt("wrong")
            self.assertEqual(self.client.get(self.url).status_code, 200)


class AdminPagesTests(TestCase):
    """Every registered model's list and add pages render for the owner."""

    def test_all_admin_pages_render(self):
        owner = make_superuser()
        self.client.login(username="owner", password=PASSWORD)
        request = RequestFactory().get("/")
        request.user = owner
        for model, model_admin in admin.site._registry.items():
            opts = model._meta
            changelist = reverse(f"admin:{opts.app_label}_{opts.model_name}_changelist")
            self.assertEqual(self.client.get(changelist).status_code, 200, changelist)
            if model_admin.has_add_permission(request):
                add = reverse(f"admin:{opts.app_label}_{opts.model_name}_add")
                self.assertEqual(self.client.get(add).status_code, 200, add)

    def test_admin_requires_staff(self):
        get_user_model().objects.create_user("visitor", password=PASSWORD)
        self.client.login(username="visitor", password=PASSWORD)
        response = self.client.get(reverse("admin:inquiries_inquiry_changelist"))
        self.assertEqual(response.status_code, 302)  # sent to the login page


class ImageUploadTests(TestCase):
    def profile_with(self, name, content):
        return Profile(headline="Engineer", photo=SimpleUploadedFile(name, content))

    def test_small_png_is_accepted(self):
        self.profile_with("me.png", PNG).full_clean()

    def test_oversized_image_is_rejected(self):
        with self.assertRaisesMessage(ValidationError, "2 MB or smaller"):
            self.profile_with("big.png", PNG + b"\0" * (2 * 1024 * 1024)).full_clean()

    def test_disallowed_format_is_rejected(self):
        for name in ["vector.svg", "anim.gif", "photo.bmp"]:
            with self.assertRaises(ValidationError, msg=name):
                self.profile_with(name, PNG).full_clean()

    def test_project_cover_has_the_same_limits(self):
        project = Project(
            slug="p", title="P", summary="s", status="live", cover_image=SimpleUploadedFile("c.gif", PNG)
        )
        with self.assertRaises(ValidationError):
            project.full_clean()


class InquiryAdminActionTests(TestCase):
    def test_bulk_status_change(self):
        make_superuser()
        self.client.login(username="owner", password=PASSWORD)
        inquiries = [
            Inquiry.objects.create(name=f"C{i}", email="c@example.com", message="m") for i in range(2)
        ]
        response = self.client.post(
            reverse("admin:inquiries_inquiry_changelist"),
            {"action": "mark_contacted", "_selected_action": [i.pk for i in inquiries]},
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(set(Inquiry.objects.values_list("status", flat=True)), {"contacted"})

    def test_inquiries_cannot_be_added_by_hand(self):
        make_superuser()
        self.client.login(username="owner", password=PASSWORD)
        self.assertEqual(self.client.get(reverse("admin:inquiries_inquiry_add")).status_code, 403)


class PurgeInquiriesTests(TestCase):
    def setUp(self):
        old = timezone.now() - timedelta(days=400)
        for status in ["new", "spam"]:
            for age in [old, timezone.now()]:
                inquiry = Inquiry.objects.create(name="X", email="x@example.com", message="m", status=status)
                Inquiry.objects.filter(pk=inquiry.pk).update(created_at=age)

    def purge(self, *args):
        out = StringIO()
        call_command("purge_inquiries", *args, stdout=out)
        return out.getvalue()

    def test_nothing_is_deleted_until_a_period_is_chosen(self):
        output = self.purge()
        self.assertEqual(Inquiry.objects.count(), 4)
        self.assertIn("not set; nothing deleted", output)

    @override_settings(INQUIRY_RETENTION_DAYS=365, INQUIRY_SPAM_RETENTION_DAYS=30)
    def test_only_expired_inquiries_are_deleted(self):
        self.purge()
        self.assertEqual(Inquiry.objects.count(), 2)
        self.assertFalse(Inquiry.objects.filter(created_at__lt=timezone.now() - timedelta(days=1)).exists())

    @override_settings(INQUIRY_RETENTION_DAYS=365, INQUIRY_SPAM_RETENTION_DAYS=None)
    def test_spam_kept_when_its_period_is_unset(self):
        self.purge()
        self.assertEqual(Inquiry.objects.filter(status="spam").count(), 2)

    @override_settings(INQUIRY_RETENTION_DAYS=365, INQUIRY_SPAM_RETENTION_DAYS=30)
    def test_dry_run_deletes_nothing(self):
        output = self.purge("--dry-run")
        self.assertEqual(Inquiry.objects.count(), 4)
        self.assertIn("would be deleted", output)
