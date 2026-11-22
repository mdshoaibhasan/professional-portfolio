from django.db import models

from apps.profiles.models import LINES_HELP, Ordered


class Service(Ordered):
    class Tier(models.TextChoices):
        PRIMARY = "primary", "Primary (development)"
        SECONDARY = "secondary", "Secondary (social media)"

    slug = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=120)
    tier = models.CharField(max_length=10, choices=Tier.choices)
    summary = models.CharField(max_length=240)
    description = models.TextField()
    ideal_for = models.CharField(max_length=240)
    includes = models.TextField(help_text=LINES_HELP)
    excludes = models.TextField(blank=True, help_text=LINES_HELP)
    benefits = models.TextField(blank=True, help_text=LINES_HELP)
    scope_note = models.TextField(
        blank=True, help_text="Optional honest note about scope or experience level."
    )
    is_active = models.BooleanField(default=True)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)

    def __str__(self) -> str:
        return self.title


class ProcessStep(Ordered):
    """Steps in "How a project runs"."""

    title = models.CharField(max_length=60)
    text = models.CharField(max_length=240)

    def __str__(self) -> str:
        return self.title
