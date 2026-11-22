from django.core.validators import RegexValidator
from django.db import models

LINES_HELP = "One item per line."


class Ordered(models.Model):
    order = models.PositiveSmallIntegerField(default=0, help_text="Lower numbers appear first.")

    class Meta:
        abstract = True
        ordering = ["order", "id"]


class Profile(models.Model):
    """The site owner. Singleton: there is only ever one row (pk=1)."""

    name = models.CharField(max_length=120, blank=True)
    headline = models.CharField(max_length=160)
    short_bio = models.TextField(blank=True)
    long_bio = models.TextField(blank=True, help_text="Paragraphs separated by a blank line.")
    location_public = models.CharField(
        max_length=120, blank=True, help_text="Country or city level only — never an address."
    )
    email_public = models.EmailField(blank=True)
    whatsapp_public = models.CharField(
        max_length=24,
        blank=True,
        validators=[RegexValidator(r"^\+?[0-9 ]{6,20}$", "Digits, spaces and an optional leading +.")],
        help_text="Optional. Publishing this makes the number public.",
    )
    photo = models.ImageField(upload_to="profile/", blank=True)
    open_to_work = models.BooleanField(default=True)
    availability_note = models.CharField(max_length=120, blank=True)
    strengths = models.TextField(blank=True, help_text=LINES_HELP)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "profile"
        verbose_name_plural = "profile"

    def __str__(self) -> str:
        return self.name or "Profile"

    def save(self, *args, **kwargs):
        self.pk = 1
        if self._state.adding and type(self).objects.filter(pk=1).exists():
            # Never silently overwrite the existing profile with a new, mostly empty one.
            raise ValueError("The profile already exists; edit it instead of creating another.")
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> "Profile":
        return cls.objects.get_or_create(pk=1, defaults={"headline": "Software Developer"})[0]


class SocialLink(Ordered):
    platform = models.CharField(max_length=40)
    url = models.URLField()

    def __str__(self) -> str:
        return self.platform


class Skill(Ordered):
    class Category(models.TextChoices):
        LANGUAGE = "language", "Language"
        FRAMEWORK = "framework", "Framework / API"
        DATA = "data", "Data"
        TOOL = "tool", "Tool"

    name = models.CharField(max_length=60, unique=True)
    category = models.CharField(max_length=12, choices=Category.choices)
    level_label = models.CharField(
        max_length=30, blank=True, help_text='Only if truthful and useful, e.g. "Basic". Never a percentage.'
    )

    def __str__(self) -> str:
        return self.name


class Experience(Ordered):
    title = models.CharField(max_length=120, blank=True)
    organization = models.CharField(max_length=120, blank=True)
    organization_url = models.URLField(blank=True)
    start_date = models.DateField(null=True, blank=True, help_text="Use the 1st of the month.")
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    summary = models.TextField()
    highlights = models.TextField(blank=True, help_text=LINES_HELP)

    class Meta(Ordered.Meta):
        verbose_name_plural = "experience"

    def __str__(self) -> str:
        return self.title or "Experience (title missing)"


class Education(Ordered):
    institution = models.CharField(max_length=160, blank=True)
    degree = models.CharField(max_length=160)
    start_year = models.PositiveSmallIntegerField(null=True, blank=True)
    status_label = models.CharField(
        max_length=80,
        blank=True,
        help_text='The real status, e.g. "Expected November 2026" or "Graduated 2026".',
    )

    class Meta(Ordered.Meta):
        verbose_name_plural = "education"

    def __str__(self) -> str:
        return self.degree


class Certification(Ordered):
    name = models.CharField(max_length=160, blank=True)
    issuer = models.CharField(max_length=120, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    credential_url = models.URLField(blank=True)
    topic = models.CharField(max_length=160)

    def __str__(self) -> str:
        return self.name or self.topic
