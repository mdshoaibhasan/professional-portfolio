"""Security headers Django doesn't set itself (ARCHITECTURE §7, D-040)."""

from django.conf import settings

# The site uses none of these browser features; deny them to the page and anything it embeds.
PERMISSIONS_POLICY = (
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()"
)

# Extra hosts per tracker, used only when CSP_TRACKERS lists them (the matching VITE_* IDs must be set too).
TRACKER_SOURCES = {
    "google": {
        "script-src": ["https://www.googletagmanager.com"],
        "img-src": [
            "https://*.google-analytics.com",
            "https://*.googletagmanager.com",
            "https://*.g.doubleclick.net",
            "https://*.google.com",
        ],
        "connect-src": [
            "https://*.google-analytics.com",
            "https://*.analytics.google.com",
            "https://*.googletagmanager.com",
            "https://*.g.doubleclick.net",
            "https://*.google.com",
        ],
    },
    "meta": {
        "script-src": ["https://connect.facebook.net"],
        "img-src": ["https://www.facebook.com"],
        "connect-src": ["https://www.facebook.com", "https://connect.facebook.net"],
    },
}


def content_security_policy() -> str:
    """Strict policy for the public site: everything from this origin, no inline scripts, no framing."""
    directives = {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'", "data:"],  # Vite inlines very small font files as data: URLs
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
    }
    for tracker in settings.CSP_TRACKERS:
        for directive, sources in TRACKER_SOURCES[tracker].items():
            directives[directive] += sources
    return "; ".join(f"{name} {' '.join(sources)}" for name, sources in directives.items())


class PermissionsPolicyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response.setdefault("Permissions-Policy", PERMISSIONS_POLICY)
        return response
