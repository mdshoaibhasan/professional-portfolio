"""Delete inquiries older than the retention period stated in the Privacy Policy.

Only inquiries marked *closed* (older than INQUIRY_RETENTION_DAYS) and spam (older than
INQUIRY_SPAM_RETENTION_DAYS) are ever deleted. New and contacted inquiries are never deleted, however
old: they are unanswered or may be an ongoing project (Privacy Policy: "unless they lead to an ongoing
project"). Retention is the owner's decision: until the periods are set, this command deletes nothing.
Runs at every start on Railway and daily from cron on cPanel (docs/DEPLOYMENT.md).
"""

from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.inquiries.models import Inquiry


class Command(BaseCommand):
    help = "Delete inquiries past their retention period (no-op until a period is configured)."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Report what would be deleted.")

    def handle(self, *args, dry_run=False, **options):
        spam = Inquiry.objects.filter(status=Inquiry.Status.SPAM)
        self._purge(
            "Closed inquiries",
            Inquiry.objects.filter(status=Inquiry.Status.CLOSED),
            settings.INQUIRY_RETENTION_DAYS,
            "INQUIRY_RETENTION_DAYS",
            dry_run,
        )
        self._purge(
            "Spam", spam, settings.INQUIRY_SPAM_RETENTION_DAYS, "INQUIRY_SPAM_RETENTION_DAYS", dry_run
        )

    def _purge(self, label, queryset, days, setting, dry_run) -> None:
        if days is None:
            self.stdout.write(f"{label}: {setting} is not set; nothing deleted.")
            return
        expired = queryset.filter(created_at__lt=timezone.now() - timedelta(days=days))
        if dry_run:
            self.stdout.write(
                f"{label}: {expired.count()} older than {days} days would be deleted (dry run)."
            )
            return
        deleted, _ = expired.delete()
        self.stdout.write(f"{label}: deleted {deleted} older than {days} days.")
