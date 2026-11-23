"""Load the initial site content from apps/profiles/seed/content.json.

Safe to re-run. Each item (the profile, each list table, each service/project by slug) is created at
most once: a SeedRecord remembers it, so content edited *or deleted* in the admin is never overwritten
or brought back. New items added to content.json later are still created. Missing owner facts stay
empty (D-018).

A database seeded before SeedRecord existed is "adopted" on the first run: everything in the seed file
is recorded as seeded and nothing is created, because a missing item may have been deleted on purpose.
"""

import json
from collections.abc import Callable
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.profiles.models import Certification, Education, Experience, Profile, SeedRecord, Skill
from apps.projects.models import CaseStudyPoint, CaseStudySection, Project, ProjectSpec
from apps.services.models import ProcessStep, Service

SEED_FILE = Path(__file__).resolve().parents[2] / "seed" / "content.json"


def text(value) -> str:
    return value or ""


def as_lines(items) -> str:
    return "\n".join(items or [])


def as_paragraphs(items) -> str:
    return "\n\n".join(items or [])


class Command(BaseCommand):
    help = "Seed initial site content (each item once; never overwrites or restores edited/deleted content)."

    @transaction.atomic
    def handle(self, *args, **options):
        data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        self.adopting = not SeedRecord.objects.exists() and (
            Profile.objects.exists() or Service.objects.exists() or Project.objects.exists()
        )
        if self.adopting:
            self.stdout.write(
                "Existing content without seed records: recording it as seeded, creating nothing."
            )
        self._profile(data["profile"])
        self._list(
            Skill,
            data["skills"],
            lambda i, s: Skill(
                name=s["name"],
                category=s["category"],
                tier=s["tier"],
                level_label=text(s["level_label"]),
                order=i,
            ),
        )
        self._list(
            Experience,
            data["experience"],
            lambda i, e: Experience(
                title=text(e["title"]),
                organization=text(e["organization"]),
                is_current=e["is_current"],
                summary=e["summary"],
                highlights=as_lines(e["highlights"]),
                order=i,
            ),
        )
        self._list(
            Education,
            data["education"],
            lambda i, e: Education(
                institution=text(e["institution"]),
                degree=e["degree"],
                status_label=text(e["status_label"]),
                order=i,
            ),
        )
        self._list(
            Certification,
            data["certifications"],
            lambda i, c: Certification(
                name=text(c["name"]),
                issuer=text(c["issuer"]),
                credential_url=text(c["credential_url"]),
                topic=c["topic"],
                order=i,
            ),
        )
        self._list(
            ProcessStep,
            data["process_steps"],
            lambda i, s: ProcessStep(title=s["title"], text=s["text"], order=i),
        )
        for index, service in enumerate(data["services"]):
            self._service(index, service)
        for index, project in enumerate(data["projects"]):
            self._project(index, project)

    def _once(self, key: str, label: str, exists: bool, create: Callable[[], None]) -> None:
        """Create an item unless it was seeded before, already exists, or the database is being adopted."""
        if SeedRecord.objects.filter(key=key).exists():
            outcome = "skipped (seeded before)"
        elif exists:
            outcome = "skipped (already present)"
        elif self.adopting:
            outcome = "skipped (missing from existing content; not recreated)"
        else:
            create()
            outcome = self.style.SUCCESS("created")
        SeedRecord.objects.get_or_create(key=key)
        self.stdout.write(f"{label}: {outcome}")

    def _profile(self, p) -> None:
        self._once("profile", "Profile", Profile.objects.exists(), lambda: self._create_profile(p))

    def _create_profile(self, p) -> None:
        Profile.objects.create(
            name=text(p["name"]),
            headline=p["headline"],
            short_bio=text(p["short_bio"]),
            long_bio=as_paragraphs(p["long_bio"]),
            location_public=text(p["location_public"]),
            email_public=text(p["email_public"]),
            whatsapp_public=text(p["whatsapp_public"]),
            open_to_work=p["open_to_work"],
            availability_note=p["availability_note"],
            strengths=as_lines(p["strengths"]),
        )

    def _list(self, model, items, build) -> None:
        self._once(
            model._meta.model_name,
            f"{model._meta.verbose_name_plural.capitalize()} ({len(items)})",
            model.objects.exists(),
            lambda: model.objects.bulk_create(build(i, item) for i, item in enumerate(items)),
        )

    def _service(self, index: int, s) -> None:
        self._once(
            f"service:{s['slug']}",
            f"Service {s['slug']}",
            Service.objects.filter(slug=s["slug"]).exists(),
            lambda: Service.objects.create(
                slug=s["slug"],
                title=s["title"],
                tier=s["tier"],
                summary=s["summary"],
                description=s["description"],
                ideal_for=s["ideal_for"],
                includes=as_lines(s["includes"]),
                excludes=as_lines(s["excludes"]),
                benefits=as_lines(s["benefits"]),
                scope_note=text(s["scope_note"]),
                order=index,
            ),
        )

    def _project(self, index: int, p) -> None:
        self._once(
            f"project:{p['slug']}",
            f"Project {p['slug']}",
            Project.objects.filter(slug=p["slug"]).exists(),
            lambda: self._create_project(index, p),
        )

    def _create_project(self, index: int, p) -> None:
        project = Project.objects.create(
            slug=p["slug"],
            title=p["title"],
            summary=p["summary"],
            status=p["status"],
            is_featured=p["is_featured"],
            is_published=True,
            technologies=as_lines(p["technologies"]),
            role=text(p["role"]),
            period=text(p["period"]),
            repo_url=text(p["repo_url"]),
            live_url=text(p["live_url"]),
            highlights=as_lines(p["highlights"]),
            order=index,
        )
        ProjectSpec.objects.bulk_create(
            ProjectSpec(project=project, label=s["label"], value=text(s["value"]), order=i)
            for i, s in enumerate(p["specs"])
        )
        for i, sec in enumerate(p["sections"]):
            section = CaseStudySection.objects.create(
                project=project,
                anchor=sec["id"],
                title=sec["title"],
                body=as_paragraphs(sec["body"]),
                order=i,
            )
            CaseStudyPoint.objects.bulk_create(
                CaseStudyPoint(section=section, title=pt["title"], text=pt["text"], order=j)
                for j, pt in enumerate(sec["points"])
            )
