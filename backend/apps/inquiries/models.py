from django.db import models

from apps.services.models import Service


class Inquiry(models.Model):
    """A message sent through the contact form. Stored before any notification is attempted."""

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"
        SPAM = "spam", "Spam"

    class Timeline(models.TextChoices):
        ASAP = "asap", "As soon as possible"
        ONE_MONTH = "1-month", "Within a month"
        ONE_TO_THREE = "1-3-months", "1–3 months"
        FLEXIBLE = "flexible", "Flexible"

    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254)
    company = models.CharField(max_length=120, blank=True)
    whatsapp = models.CharField(max_length=24, blank=True)
    service = models.ForeignKey(Service, null=True, blank=True, on_delete=models.SET_NULL)
    message = models.TextField(max_length=5000)
    budget = models.CharField(max_length=80, blank=True)
    timeline = models.CharField(max_length=12, choices=Timeline.choices, blank=True)

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.NEW, db_index=True)
    spam_reason = models.CharField(max_length=40, blank=True)
    ip_hash = models.CharField(max_length=64, blank=True, help_text="Keyed hash; the raw IP is never stored.")
    user_agent = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    notified_at = models.DateTimeField(null=True, blank=True)
    notify_error = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "inquiries"

    def __str__(self) -> str:
        return f"{self.name} ({self.created_at:%Y-%m-%d})" if self.created_at else self.name
