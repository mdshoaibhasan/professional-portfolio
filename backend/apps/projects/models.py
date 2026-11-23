from django.db import models

from apps.profiles.models import LINES_HELP, Ordered
from apps.uploads import IMAGE_HELP, IMAGE_VALIDATORS


class Project(Ordered):
    class Status(models.TextChoices):
        PRE_LAUNCH = "pre-launch", "Pre-launch"
        LIVE = "live", "Live"
        ARCHIVED = "archived", "Archived"

    slug = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=120)
    summary = models.CharField(max_length=240)
    status = models.CharField(max_length=12, choices=Status.choices)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False, help_text="Only published projects appear on the site.")
    technologies = models.TextField(blank=True, help_text=LINES_HELP)
    role = models.CharField(max_length=160, blank=True)
    period = models.CharField(max_length=40, blank=True)
    repo_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    highlights = models.TextField(blank=True, help_text=LINES_HELP)
    cover_image = models.ImageField(
        upload_to="projects/", blank=True, validators=IMAGE_VALIDATORS, help_text=IMAGE_HELP
    )
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title


class ProjectSpec(Ordered):
    """Spec-sheet row, e.g. Stack / Scope / Role (DESIGN_SYSTEM §1)."""

    project = models.ForeignKey(Project, related_name="specs", on_delete=models.CASCADE)
    label = models.CharField(max_length=30)
    value = models.CharField(max_length=200, blank=True, help_text="Leave empty if not known yet.")

    def __str__(self) -> str:
        return self.label


class CaseStudySection(Ordered):
    project = models.ForeignKey(Project, related_name="sections", on_delete=models.CASCADE)
    anchor = models.SlugField(max_length=40, help_text="Used in the page URL, e.g. #architecture.")
    title = models.CharField(max_length=120)
    body = models.TextField(blank=True, help_text="Paragraphs separated by a blank line.")

    class Meta(Ordered.Meta):
        constraints = [models.UniqueConstraint(fields=["project", "anchor"], name="unique_section_anchor")]

    def __str__(self) -> str:
        return self.title


class CaseStudyPoint(Ordered):
    section = models.ForeignKey(CaseStudySection, related_name="points", on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    text = models.TextField()

    def __str__(self) -> str:
        return self.title
