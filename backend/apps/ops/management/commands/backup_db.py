from django.core.management.base import BaseCommand, CommandError

from apps.ops.sqlite_backup import BackupError, new_backup, prune


class Command(BaseCommand):
    help = "Write a consistent snapshot of the SQLite database to BACKUP_DIR and keep the newest N."

    def add_arguments(self, parser):
        parser.add_argument("--keep", type=int, default=3, help="Regular backups to keep (default 3).")

    def handle(self, *args, keep, **options):
        if keep < 1:
            raise CommandError("--keep must be at least 1.")
        try:
            path = new_backup()
        except BackupError as error:
            raise CommandError(str(error)) from error
        removed = prune(keep)
        self.stdout.write(f"Backup written: {path} ({path.stat().st_size / 1024:.0f} KB)")
        if removed:
            self.stdout.write(f"Removed {len(removed)} older backup(s).")
