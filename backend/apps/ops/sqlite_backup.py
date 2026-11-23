"""Consistent SQLite snapshots and restores using SQLite's online backup API (D-046).

Copying the database file while the site is writing can produce a corrupt copy. The backup API copies a
consistent state even while other processes use the database, so these work on a running site.
"""

import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path

from django.conf import settings


class BackupError(Exception):
    pass


def database_path() -> Path:
    db = settings.DATABASES["default"]
    if db["ENGINE"] != "django.db.backends.sqlite3":
        raise BackupError("Only SQLite databases are supported.")
    return Path(db["NAME"])


def backup_dir() -> Path:
    return Path(settings.BACKUP_DIR) if settings.BACKUP_DIR else database_path().parent / "backups"


def _connect_readonly(path: Path) -> sqlite3.Connection:
    return sqlite3.connect(f"{path.resolve().as_uri()}?mode=ro", uri=True)


def check(path: Path) -> None:
    """Refuse anything that isn't an intact SQLite database of this project."""
    if not path.is_file():
        raise BackupError(f"No file at {path}.")
    try:
        # closing(): sqlite3's own context manager only commits, it never closes the connection.
        with closing(_connect_readonly(path)) as db:
            if db.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                raise BackupError(f"{path} failed SQLite's integrity check.")
            if not db.execute("SELECT 1 FROM sqlite_master WHERE name = 'django_migrations'").fetchone():
                raise BackupError(f"{path} is not a Django database.")
    except sqlite3.DatabaseError as error:
        raise BackupError(f"{path} is not a readable SQLite database ({error}).") from error


def snapshot(source: Path, destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    src = _connect_readonly(source)
    dst = sqlite3.connect(destination)
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    check(destination)
    return destination


def new_backup(prefix: str = "db") -> Path:
    stamp = datetime.now(UTC).strftime("%Y%m%d-%H%M%S")
    return snapshot(database_path(), backup_dir() / f"{prefix}-{stamp}.sqlite3")


def prune(keep: int) -> list[Path]:
    """Delete all but the newest `keep` regular backups (pre-restore safety copies are kept)."""
    backups = sorted(backup_dir().glob("db-*.sqlite3"), reverse=True)
    removed = backups[keep:]
    for path in removed:
        path.unlink()
    return removed


def restore(backup: Path) -> Path:
    """Copy `backup` into the live database. Takes a safety snapshot of the current data first."""
    check(backup)
    safety = new_backup(prefix="pre-restore")
    src = _connect_readonly(backup)
    dst = sqlite3.connect(database_path())
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    return safety
