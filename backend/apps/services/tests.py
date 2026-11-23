import os
import subprocess
import sys
from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase, TestCase

from .models import Service

BACKEND_DIR = Path(settings.BASE_DIR)


def make_service(slug="web", **fields) -> Service:
    defaults = dict(
        title="Web", tier=Service.Tier.PRIMARY, summary="s", description="d", ideal_for="i", includes="A\nB"
    )
    return Service.objects.create(slug=slug, **{**defaults, **fields})


class ServiceApiTests(TestCase):
    def test_inactive_services_are_hidden(self):
        make_service("on")
        make_service("off", is_active=False)
        self.assertEqual([s["slug"] for s in self.client.get("/api/v1/services/").json()], ["on"])
        self.assertEqual(self.client.get("/api/v1/services/off/").status_code, 404)

    def test_lists_and_empty_note(self):
        make_service(excludes="", benefits="  One \n\nTwo")
        data = self.client.get("/api/v1/services/web/").json()
        self.assertEqual(data["includes"], ["A", "B"])
        self.assertEqual(data["excludes"], [])
        self.assertEqual(data["benefits"], ["One", "Two"])
        self.assertIsNone(data["scope_note"])


class ProductionSettingsTests(SimpleTestCase):
    """prod.py must refuse unsafe configuration and pass Django's deployment checks when configured."""

    SAFE_ENV = {
        "DJANGO_SETTINGS_MODULE": "config.settings.prod",
        "DJANGO_SECRET_KEY": "x" * 30 + "-test-only-" + "y" * 30,
        "DJANGO_ALLOWED_HOSTS": "example.com",
        "DJANGO_ADMIN_PATH": "manage-7f3k",
        "SITE_URL": "https://portfolio.example",
    }

    def run_check(self, **overrides):
        env = {**os.environ, **self.SAFE_ENV, **overrides}
        return subprocess.run(
            [sys.executable, "manage.py", "check", "--deploy", "--fail-level", "WARNING"],
            cwd=BACKEND_DIR,
            env=env,
            capture_output=True,
            text=True,
            timeout=120,
        )

    def test_safe_configuration_passes_deploy_checks(self):
        result = self.run_check()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_cpanel_passenger_entry_point_loads_the_app(self):
        env = {**os.environ, **self.SAFE_ENV}
        env.pop("DJANGO_SETTINGS_MODULE")  # Passenger doesn't set it; wsgi.py defaults to production
        result = subprocess.run(
            [sys.executable, "-c", "import passenger_wsgi; print(callable(passenger_wsgi.application))"],
            cwd=BACKEND_DIR,
            env=env,
            capture_output=True,
            text=True,
            timeout=120,
        )
        self.assertEqual(result.stdout.strip(), "True", result.stderr)

    def test_rejects_missing_or_non_https_site_url(self):
        for value in ["", "http://portfolio.example", "https://localhost:8000"]:
            result = self.run_check(SITE_URL=value)
            self.assertNotEqual(result.returncode, 0, value)
            self.assertIn("SITE_URL", result.stderr, value)

    def test_rejects_weak_secret_key(self):
        result = self.run_check(DJANGO_SECRET_KEY="change-me")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("DJANGO_SECRET_KEY", result.stderr)

    def test_rejects_default_admin_path(self):
        result = self.run_check(DJANGO_ADMIN_PATH="admin")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("DJANGO_ADMIN_PATH", result.stderr)

    def test_rejects_missing_hosts(self):
        result = self.run_check(DJANGO_ALLOWED_HOSTS="")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("DJANGO_ALLOWED_HOSTS", result.stderr)
