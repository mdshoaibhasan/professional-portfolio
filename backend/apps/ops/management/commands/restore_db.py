from pathlib import Path

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from apps.ops.sqlite_backup import BackupError, restore


class Command(BaseCommand):
    help = "Replace the live database with a backup (a safety snapshot of the current data is taken first)."

    def add_arguments(self, parser):
        parser.add_argument("backup", help="Path to a .sqlite3 file made by backup_db.")
        parser.add_argument("--yes", action="store_true", help="Confirm: the current data will be replaced.")

    def handle(self, *args, backup, yes, **options):
        if not yes:
            raise CommandError("This replaces all current data. Re-run with --yes to confirm.")
        try:
            safety = restore(Path(backup))
        except BackupError as error:
            raise CommandError(str(error)) from error
        self.stdout.write(f"Restored {backup}. The data it replaced was saved to {safety}.")
        # A backup from an older release may lack newer migrations.
        call_command("migrate", interactive=False, verbosity=0)
        self.stdout.write("Migrations applied.")
