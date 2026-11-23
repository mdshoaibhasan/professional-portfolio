"""SPA shell with per-URL <head> tags, sitemap.xml and robots.txt (D-006, D-038)."""

import json
from pathlib import Path

from django.conf import settings
from django.http import HttpResponse
from django.utils.html import escape
from django.views.decorators.http import require_safe

from apps.projects.models import Project
from apps.services.models import Service

from .pages import STATIC_PAGES, PageMeta, absolute, resolve

SITEMAP_EXCLUDED = {"/privacy"}  # reachable and crawlable, but not worth listing


def _json_ld(data: dict) -> str:
    # Escape characters that could close the <script> element or start HTML in it.
    text = json.dumps({"@context": "https://schema.org", **data}, ensure_ascii=False)
    for char in "<>&":  # e.g. "<" becomes the six characters backslash-u-0-0-3-c
        text = text.replace(char, "\\" + f"u{ord(char):04x}")
    return text


def render_head(meta: PageMeta) -> str:
    """Tags inserted before </head>. Every value is escaped; none comes from the request except the path."""
    tags = [
        f"<title>{escape(meta.title)}</title>",
        f'<meta name="description" content="{escape(meta.description)}" />',
        f'<link rel="canonical" href="{escape(meta.canonical)}" />',
        f'<meta property="og:type" content="{meta.og_type}" />',
        f'<meta property="og:site_name" content="{escape(meta.site_name)}" />',
        f'<meta property="og:title" content="{escape(meta.title)}" />',
        f'<meta property="og:description" content="{escape(meta.description)}" />',
        f'<meta property="og:url" content="{escape(meta.canonical)}" />',
        f'<meta property="og:image" content="{escape(meta.image_url)}" />',
        '<meta name="twitter:card" content="summary_large_image" />',
    ]
    if meta.status == 404:
        tags.append('<meta name="robots" content="noindex" />')
    tags += [f'<script type="application/ld+json">{_json_ld(item)}</script>' for item in meta.json_ld]
    return "\n    ".join(tags)


def _index_html() -> str | None:
    index = Path(settings.FRONTEND_DIST_DIR) / "index.html"
    return index.read_text(encoding="utf-8") if index.is_file() else None


@require_safe
def spa_shell(request, path: str = ""):
    html = _index_html()
    if html is None:
        return HttpResponse(
            "Frontend build not found. Run `npm run build` in frontend/ (FRONTEND_DIST_DIR).",
            status=503,
            content_type="text/plain; charset=utf-8",
        )
    meta = resolve(request.path)
    html = html.replace("</head>", f"    {render_head(meta)}\n  </head>", 1)
    response = HttpResponse(html, status=meta.status)
    # Short cache: content edited in the admin should reach crawlers quickly.
    response["Cache-Control"] = "public, max-age=60"
    return response


@require_safe
def sitemap(request):
    entries = [(path, None) for path in STATIC_PAGES if path not in SITEMAP_EXCLUDED]
    entries += [
        (f"/projects/{p.slug}", p.updated_at.date().isoformat())
        for p in Project.objects.filter(is_published=True).only("slug", "updated_at")
    ]
    entries += [
        (f"/services/{slug}", None)
        for slug in Service.objects.filter(is_active=True).values_list("slug", flat=True)
    ]
    urls = "".join(
        f"<url><loc>{escape(absolute(path))}</loc>"
        + (f"<lastmod>{lastmod}</lastmod>" if lastmod else "")
        + "</url>"
        for path, lastmod in entries
    )
    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n'
    return HttpResponse(xml, content_type="application/xml; charset=utf-8")


@require_safe
def robots(request):
    # The admin path is deliberately not listed: robots.txt is public and would reveal it.
    body = f"User-agent: *\nDisallow: /api/\n\nSitemap: {absolute('/sitemap.xml')}\n"
    return HttpResponse(body, content_type="text/plain; charset=utf-8")
