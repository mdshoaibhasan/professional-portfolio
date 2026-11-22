"""Load the initial site content from apps/profiles/seed/content.json.

Safe to re-run: it only fills empty tables and creates missing projects/services by slug,
so content edited in the admin is never overwritten. Missing owner facts stay empty (D-018).
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.profiles.models import Certification, Education, Experience, Profile, Skill
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
    help = "Seed initial site content (only fills empty tables; never overwrites edits)."

    @transaction.atomic
    def handle(self, *args, **options):
        data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        self._profile(data["profile"])
        self._list(
            Skill,
            data["skills"],
            lambda i, s: Skill(
                name=s["name"], category=s["category"], level_label=text(s["level_label"]), order=i
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

    def _report(self, label: str, created: bool) -> None:
        verb = self.style.SUCCESS("created") if created else "skipped (already present)"
        self.stdout.write(f"{label}: {verb}")

    def _profile(self, p) -> None:
        if Profile.objects.exists():
            return self._report("Profile", False)
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
        self._report("Profile", True)

    def _list(self, model, items, build) -> None:
        label = model._meta.verbose_name_plural.capitalize()
        if model.objects.exists():
            return self._report(label, False)
        model.objects.bulk_create(build(i, item) for i, item in enumerate(items))
        self._report(f"{label} ({len(items)})", True)

    def _service(self, index: int, s) -> None:
        _, created = Service.objects.get_or_create(
            slug=s["slug"],
            defaults=dict(
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
        self._report(f"Service {s['slug']}", created)

    def _project(self, index: int, p) -> None:
        if Project.objects.filter(slug=p["slug"]).exists():
            return self._report(f"Project {p['slug']}", False)
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
        self._report(f"Project {p['slug']}", True)
