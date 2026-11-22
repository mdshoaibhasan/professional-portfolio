"""Helpers for admin-friendly text fields and the API's `null`-for-missing convention (D-018)."""

from datetime import date


def lines(text: str) -> list[str]:
    """Split a "one item per line" field into a clean list."""
    return [line.strip() for line in text.splitlines() if line.strip()]


def paragraphs(text: str) -> list[str]:
    """Split a field into paragraphs separated by blank lines."""
    blocks = text.replace("\r\n", "\n").split("\n\n")
    return [" ".join(block.split()) for block in blocks if block.strip()]


def or_none(value: str | None) -> str | None:
    """Missing owner content is exposed as null so the frontend shows a placeholder."""
    return value.strip() if value and value.strip() else None


def month_year(value: date | None) -> str | None:
    return value.strftime("%b %Y") if value else None
