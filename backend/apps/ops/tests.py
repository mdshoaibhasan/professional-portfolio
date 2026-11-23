import sqlite3
import tempfile
from contextlib import closing
from pathlib import Path
from unittest import mock

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, override_settings

from apps.ops import sqlite_backup
from apps.ops.sqlite_backup import BackupError, new_backup, prune, restore


def make_db(path: Path, rows: list[str]) -> None:
    with closing(sqlite3.connect(path)) as db, db:  # outer: close; inner: commit
        db.execute("CREATE TABLE IF NOT EXISTS django_migrations (id INTEGER PRIMARY KEY, app TEXT)")
        db.execute("CREATE TABLE IF NOT EXISTS inquiry (name TEXT)")
        db.execute("DELETE FROM inquiry")
        db.executemany("INSERT INTO inquiry VALUES (?)", [(r,) for r in rows])


def names(path: Path) -> list[str]:
    with closing(sqlite3.connect(path)) as db:
        return [row[0] for row in db.execute("SELECT name FROM inquiry ORDER BY name")]


class SqliteBackupTests(SimpleTestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.live = self.dir / "db.sqlite3"
        make_db(self.live, ["alice", "bob"])
        self.path_patch = mock.patch.object(sqlite_backup, "database_path", return_value=self.live)
        self.path_patch.start()
        self.settings_patch = override_settings(BACKUP_DIR=str(self.dir / "backups"))
        self.settings_patch.enable()

    def tearDown(self):
        self.settings_patch.disable()
        self.path_patch.stop()
        self.tmp.cleanup()

    def test_backup_then_restore_round_trip(self):
        backup = new_backup()
        make_db(self.live, ["mallory"])  # data changes after the backup
        safety = restore(backup)
        self.assertEqual(names(self.live), ["alice", "bob"])
        self.assertEqual(names(safety), ["mallory"])  # what was replaced is kept

    def test_snapshot_is_consistent_while_a_write_is_open(self):
        writer = sqlite3.connect(self.live)
        writer.execute("BEGIN")
        writer.execute("INSERT INTO inquiry VALUES ('uncommitted')")
        try:
            backup = new_backup()
        finally:
            writer.rollback()
            writer.close()
        self.assertEqual(names(backup), ["alice", "bob"])

    def test_refuses_files_that_are_not_intact_django_databases(self):
        junk = self.dir / "junk.sqlite3"
        junk.write_bytes(b"not a database")
        other = self.dir / "other.sqlite3"
        with closing(sqlite3.connect(other)) as db:
            db.execute("CREATE TABLE t (x)")
        for path in [junk, other, self.dir / "missing.sqlite3"]:
            with self.assertRaises(BackupError, msg=path.name):
                restore(path)
        self.assertEqual(names(self.live), ["alice", "bob"])  # untouched

    def test_prune_keeps_the_newest_and_never_safety_copies(self):
        backups = self.dir / "backups"
        backups.mkdir()
        for stamp in ["20260101-000000", "20260102-000000", "20260103-000000"]:
            (backups / f"db-{stamp}.sqlite3").write_bytes(b"x")
        (backups / "pre-restore-20250101-000000.sqlite3").write_bytes(b"x")
        prune(keep=1)
        self.assertEqual(
            sorted(p.name for p in backups.iterdir()),
            ["db-20260103-000000.sqlite3", "pre-restore-20250101-000000.sqlite3"],
        )

    def test_restore_command_requires_confirmation(self):
        backup = new_backup()
        with self.assertRaisesMessage(CommandError, "--yes"):
            call_command("restore_db", str(backup))

    def test_backup_command_reports_the_file(self):
        from io import StringIO

        out = StringIO()
        call_command("backup_db", "--keep", "2", stdout=out)
        self.assertIn("Backup written:", out.getvalue())
        self.assertEqual(len(list((self.dir / "backups").glob("db-*.sqlite3"))), 1)
