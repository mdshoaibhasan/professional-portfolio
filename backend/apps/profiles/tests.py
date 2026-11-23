import json
from datetime import date
from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from apps.profiles.management.commands.seed_content import SEED_FILE
from apps.projects.models import Project
from apps.services.models import Service

from .models import Education, Experience, Profile, SeedRecord, Skill

SITE_URL = "/api/v1/site/"


class SeedRoundTripTests(TestCase):
    """The API must return exactly the content that was seeded (frontend contract, D-007)."""

    @classmethod
    def setUpTestData(cls):
        call_command("seed_content", stdout=StringIO())
        cls.seed = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    def test_site_content_matches_seed(self):
        data = self.client.get(SITE_URL).json()
        profile = {**data["profile"]}
        self.assertIsNone(profile.pop("photo"))  # API-only field, not in the seed
        self.assertEqual(profile, self.seed["profile"])
        for key in ["skills", "experience", "education", "certifications", "process_steps"]:
            self.assertEqual(data[key], self.seed[key], key)
        self.assertEqual(data["social_links"], [])

    def test_services_match_seed(self):
        self.assertEqual(self.client.get("/api/v1/services/").json(), self.seed["services"])

    def test_project_detail_matches_seed(self):
        expected = self.seed["projects"][0]
        data = self.client.get(f"/api/v1/projects/{expected['slug']}/").json()
        self.assertIsNone(data.pop("cover_image"))
        self.assertEqual(data, expected)

    def test_project_list_omits_case_study_sections(self):
        [item] = self.client.get("/api/v1/projects/").json()
        self.assertNotIn("sections", item)
        self.assertEqual(item["specs"], self.seed["projects"][0]["specs"])

    def test_seed_is_idempotent_and_never_overwrites_edits(self):
        Profile.objects.filter(pk=1).update(name="Edited Name")
        Service.objects.filter(slug="web-development").update(title="Edited")
        call_command("seed_content", stdout=StringIO())
        self.assertEqual(Profile.load().name, "Edited Name")
        self.assertEqual(Service.objects.get(slug="web-development").title, "Edited")
        self.assertEqual(Skill.objects.count(), len(self.seed["skills"]))
        self.assertEqual(Project.objects.count(), 1)


def seed() -> str:
    out = StringIO()
    call_command("seed_content", stdout=out)
    return out.getvalue()


class SeedSafetyTests(TestCase):
    """Re-running the seed must never block, overwrite or resurrect content (backend README review)."""

    @classmethod
    def setUpTestData(cls):
        cls.data = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    def test_reading_the_site_before_seeding_does_not_block_the_profile_seed(self):
        before = self.client.get(SITE_URL)
        self.assertEqual(before.status_code, 200)
        self.assertEqual(before.json()["profile"]["headline"], "Software Engineer")
        self.assertFalse(Profile.objects.exists())  # reading created nothing
        seed()
        self.assertEqual(Profile.load().short_bio, self.data["profile"]["short_bio"])

    def test_deleted_content_is_not_brought_back(self):
        seed()
        project_slug = self.data["projects"][0]["slug"]
        service_slug = self.data["services"][0]["slug"]
        Project.objects.filter(slug=project_slug).delete()
        Service.objects.filter(slug=service_slug).delete()
        Skill.objects.all().delete()
        output = seed()
        self.assertFalse(Project.objects.filter(slug=project_slug).exists())
        self.assertFalse(Service.objects.filter(slug=service_slug).exists())
        self.assertFalse(Skill.objects.exists())
        self.assertNotIn("created", output)
        self.assertEqual(self.client.get(f"/api/v1/projects/{project_slug}/").status_code, 404)

    def test_items_added_to_the_seed_file_later_are_still_created(self):
        seed()
        slug = self.data["services"][-1]["slug"]
        Service.objects.filter(slug=slug).delete()
        SeedRecord.objects.filter(key=f"service:{slug}").delete()  # as if the item were new in content.json
        seed()
        self.assertTrue(Service.objects.filter(slug=slug).exists())

    def test_existing_database_without_records_is_adopted_not_refilled(self):
        seed()
        SeedRecord.objects.all().delete()  # a database seeded before SeedRecord existed
        slug = self.data["projects"][0]["slug"]
        Project.objects.filter(slug=slug).delete()
        output = seed()
        self.assertIn("creating nothing", output)
        self.assertFalse(Project.objects.filter(slug=slug).exists())
        self.assertTrue(SeedRecord.objects.filter(key=f"project:{slug}").exists())
        seed()
        self.assertFalse(Project.objects.filter(slug=slug).exists(), "still gone on the next run")


class SiteContentTests(TestCase):
    def test_missing_facts_are_null_not_empty_strings(self):
        Profile.objects.create(headline="Developer")
        profile = self.client.get(SITE_URL).json()["profile"]
        for field in ["name", "short_bio", "long_bio", "email_public", "whatsapp_public", "photo"]:
            self.assertIsNone(profile[field], field)
        self.assertEqual(profile["strengths"], [])

    def test_profile_is_a_singleton(self):
        Profile.objects.create(headline="One")
        with self.assertRaises(ValueError):
            Profile.objects.create(headline="Two")
        profile = Profile.load()
        profile.headline = "Edited"
        profile.save()
        self.assertEqual(Profile.objects.count(), 1)
        self.assertEqual(Profile.load().headline, "Edited")

    def test_dates_are_month_year_and_lists_are_split(self):
        Experience.objects.create(
            title="Operations Lead",
            start_date=date(2023, 1, 1),
            end_date=date(2024, 6, 1),
            summary="Ran things.",
            highlights="First\n\n  Second  \n",
        )
        Education.objects.create(degree="B.Sc.", start_year=2022)
        data = self.client.get(SITE_URL).json()
        [exp] = data["experience"]
        self.assertEqual((exp["start_date"], exp["end_date"]), ("Jan 2023", "Jun 2024"))
        self.assertEqual(exp["highlights"], ["First", "Second"])
        self.assertEqual(data["education"][0]["start_year"], "2022")

    def test_long_bio_paragraphs(self):
        Profile.objects.create(headline="Dev", long_bio="First para\nwraps.\n\nSecond para.")
        self.assertEqual(
            self.client.get(SITE_URL).json()["profile"]["long_bio"], ["First para wraps.", "Second para."]
        )

    def test_site_endpoint_is_read_only_and_cacheable(self):
        response = self.client.get(SITE_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "public, max-age=60")
        self.assertEqual(response["Content-Type"], "application/json")
        for method in ("post", "put", "patch", "delete"):
            self.assertEqual(getattr(self.client, method)(SITE_URL).status_code, 405, method)
