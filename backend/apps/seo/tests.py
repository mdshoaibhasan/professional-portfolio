import json
import re
import tempfile
from io import StringIO
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase, override_settings

from apps.profiles.models import Profile, SocialLink
from apps.projects.models import Project
from apps.services.models import Service

from .pages import STATIC_PAGES

SITE = "https://portfolio.example"
INDEX = (
    '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n  </head>\n'
    '  <body><div id="root"></div></body>\n</html>\n'
)


def head(response) -> str:
    return response.content.decode().split("</head>")[0]


def json_ld(response) -> list[dict]:
    return [
        json.loads(m)
        for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', response.content.decode())
    ]


class ShellTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.dist = tempfile.TemporaryDirectory()
        (Path(cls.dist.name) / "index.html").write_text(INDEX, encoding="utf-8")
        cls.settings_override = override_settings(FRONTEND_DIST_DIR=cls.dist.name, SITE_URL=SITE)
        cls.settings_override.enable()

    @classmethod
    def tearDownClass(cls):
        cls.settings_override.disable()
        cls.dist.cleanup()
        super().tearDownClass()

    @classmethod
    def setUpTestData(cls):
        call_command("seed_content", stdout=StringIO())


class ShellTests(ShellTestCase):
    def test_every_static_page_gets_its_own_title_description_and_canonical(self):
        for path, (_, description) in STATIC_PAGES.items():
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200, path)
            html = head(response)
            self.assertEqual(html.count("<title>"), 1, path)
            self.assertIn(f'content="{description}"', html.replace("&#x27;", "'"), path)
            self.assertIn(f'<link rel="canonical" href="{SITE}{path}" />', html, path)
            self.assertIn(f'<meta property="og:image" content="{SITE}/og-default.png" />', html, path)

    def test_trailing_slash_and_case_of_canonical(self):
        self.assertIn(f'href="{SITE}/about"', head(self.client.get("/about/")))

    def test_project_page_uses_project_content(self):
        project = Project.objects.get(slug="backgroundbridge")
        html = head(self.client.get("/projects/backgroundbridge"))
        self.assertIn(f"<title>{project.title} case study", html)
        self.assertIn('<meta property="og:type" content="article" />', html)
        [work] = json_ld(self.client.get("/projects/backgroundbridge"))
        self.assertEqual((work["@type"], work["name"]), ("CreativeWork", project.title))

    def test_seo_fields_override_defaults(self):
        Service.objects.filter(slug="web-development").update(seo_title="Websites", seo_description="Custom.")
        html = head(self.client.get("/services/web-development"))
        self.assertIn("<title>Websites", html)
        self.assertIn('name="description" content="Custom."', html)

    def test_unknown_unpublished_and_inactive_pages_are_real_404s(self):
        Project.objects.filter(slug="backgroundbridge").update(is_published=False)
        Service.objects.filter(slug="web-development").update(is_active=False)
        for path in ["/nope", "/projects/backgroundbridge", "/services/web-development", "/projects/a/b"]:
            response = self.client.get(path)
            self.assertEqual(response.status_code, 404, path)
            self.assertIn('<meta name="robots" content="noindex" />', head(response), path)
            self.assertIn(
                '<div id="root">', response.content.decode(), path
            )  # React still renders the 404 page

    def test_api_static_and_media_never_fall_through_to_the_shell(self):
        for path in ["/api/v1/nope", "/static/x.js", "/media/x.png"]:
            response = self.client.get(path)
            self.assertEqual(response.status_code, 404, path)
            self.assertNotIn(b'id="root"', response.content, path)

    def test_only_safe_methods(self):
        self.assertEqual(self.client.post("/about").status_code, 405)

    def test_admin_content_is_escaped(self):
        Project.objects.filter(slug="backgroundbridge").update(
            title="Evil </title><script>alert(1)</script>", summary='"><img src=x onerror=alert(1)>'
        )
        body = self.client.get("/projects/backgroundbridge").content.decode()
        self.assertNotIn("<script>alert(1)</script>", body)
        self.assertNotIn("<img src=x", body)
        self.assertNotIn("</title><script>", body)

    def test_missing_build_is_reported_not_crashed(self):
        with override_settings(FRONTEND_DIST_DIR="/does/not/exist"):
            response = self.client.get("/")
        self.assertEqual(response.status_code, 503)


class StructuredDataTests(ShellTestCase):
    def test_no_person_is_published_without_a_name(self):
        Profile.objects.update(name="")
        self.assertEqual(json_ld(self.client.get("/")), [])
        [offer] = json_ld(self.client.get("/services/web-development"))
        self.assertNotIn("provider", offer)

    def test_person_uses_only_supplied_facts(self):
        Profile.objects.update(name="Test Owner")
        SocialLink.objects.create(platform="GitHub", url="https://github.com/example")
        website, person = json_ld(self.client.get("/"))
        self.assertEqual(website["@type"], "WebSite")
        self.assertEqual(person["name"], "Test Owner")
        self.assertEqual(person["sameAs"], ["https://github.com/example"])
        self.assertIn("Django", person["knowsAbout"])
        self.assertNotIn("email", person)
        self.assertNotIn("telephone", person)
        [page] = json_ld(self.client.get("/about"))
        self.assertEqual(page["@type"], "ProfilePage")

    def test_learning_skills_are_not_claimed_as_known(self):
        from apps.profiles.models import Skill

        Profile.objects.update(name="Test Owner")
        Skill.objects.create(name="Rust", category="backend", tier="learning")
        _, person = json_ld(self.client.get("/"))
        self.assertNotIn("Rust", person["knowsAbout"])


class SitemapRobotsTests(ShellTestCase):
    def test_sitemap_lists_public_pages_only(self):
        Service.objects.filter(slug="web-development").update(is_active=False)
        response = self.client.get("/sitemap.xml")
        self.assertEqual(response["Content-Type"], "application/xml; charset=utf-8")
        locs = re.findall(r"<loc>(.*?)</loc>", response.content.decode())
        self.assertIn(f"{SITE}/", locs)
        self.assertIn(f"{SITE}/projects/backgroundbridge", locs)
        self.assertIn(f"{SITE}/services/backend-api-development", locs)
        self.assertNotIn(f"{SITE}/services/web-development", locs)
        self.assertNotIn(f"{SITE}/privacy", locs)

    def test_robots_points_to_sitemap_and_hides_admin_path(self):
        body = self.client.get("/robots.txt").content.decode()
        self.assertIn(f"Sitemap: {SITE}/sitemap.xml", body)
        self.assertIn("Disallow: /api/", body)
        self.assertNotIn("admin", body)


class SecurityHeaderTests(ShellTestCase):
    def test_pages_get_a_strict_content_security_policy(self):
        csp = self.client.get("/about")["Content-Security-Policy"]
        self.assertIn("script-src 'self';", csp)
        self.assertIn("frame-ancestors 'none'", csp)
        self.assertIn("object-src 'none'", csp)
        self.assertNotIn("unsafe-inline", csp)
        self.assertNotIn("unsafe-eval", csp)
        self.assertNotIn("googletagmanager", csp)

    def test_tracker_hosts_only_when_configured(self):
        with override_settings(CSP_TRACKERS=["google"]):
            csp = self.client.get("/")["Content-Security-Policy"]
        self.assertIn("https://www.googletagmanager.com", csp)
        self.assertNotIn("facebook", csp)

    def test_permissions_policy_everywhere_but_csp_only_on_pages(self):
        for path in ["/", "/api/v1/site/", "/robots.txt", "/admin/login/"]:
            response = self.client.get(path)
            self.assertIn("camera=()", response["Permissions-Policy"], path)
            self.assertEqual(response["X-Content-Type-Options"], "nosniff", path)
        self.assertNotIn("Content-Security-Policy", self.client.get("/admin/login/"))


class DemoNoIndexTests(ShellTestCase):
    def test_indexing_allowed_by_default(self):
        response = self.client.get("/about")
        self.assertNotIn("X-Robots-Tag", response)
        self.assertNotIn('content="noindex', head(response))
        self.assertIn("Sitemap:", self.client.get("/robots.txt").content.decode())

    @override_settings(SEO_ALLOW_INDEXING=False)
    def test_demo_mode_says_noindex_everywhere_but_allows_crawling(self):
        for path in ["/", "/about", "/api/v1/site/", "/robots.txt", "/sitemap.xml"]:
            self.assertEqual(self.client.get(path)["X-Robots-Tag"], "noindex, nofollow", path)
        html = head(self.client.get("/"))
        self.assertEqual(html.count('name="robots"'), 1)
        self.assertIn('<meta name="robots" content="noindex, nofollow" />', html)
        robots = self.client.get("/robots.txt").content.decode()
        self.assertNotIn("Sitemap:", robots)
        self.assertNotIn("Disallow: /\n", robots)  # crawlers must be able to read the noindex


class MediaServingTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.media = tempfile.TemporaryDirectory()
        (Path(cls.media.name) / "profile").mkdir()
        (Path(cls.media.name) / "profile" / "me.png").write_bytes(b"png-bytes")
        (Path(cls.media.name).parent / "outside-media.txt").write_text("secret", encoding="utf-8")

    @classmethod
    def tearDownClass(cls):
        (Path(cls.media.name).parent / "outside-media.txt").unlink(missing_ok=True)
        cls.media.cleanup()
        super().tearDownClass()

    def test_off_by_default(self):
        with override_settings(MEDIA_ROOT=self.media.name):
            self.assertEqual(self.client.get("/media/profile/me.png").status_code, 404)

    def test_served_when_enabled_without_leaving_media_root(self):
        with override_settings(MEDIA_ROOT=self.media.name, SERVE_MEDIA=True):
            response = self.client.get("/media/profile/me.png")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(b"".join(response.streaming_content), b"png-bytes")
            for attempt in ["/media/../outside-media.txt", "/media/%2e%2e/outside-media.txt"]:
                refused = self.client.get(attempt)
                self.assertIn(refused.status_code, (400, 404), attempt)  # 400: Django's traversal guard
                self.assertNotIn(b"secret", refused.content, attempt)
