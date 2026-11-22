"""Shared base for the public, read-only content API."""

from rest_framework.permissions import AllowAny


class PublicReadOnlyMixin:
    """Anyone may read; nothing may be written. Responses are briefly cacheable."""

    permission_classes = [AllowAny]
    http_method_names = ["get", "head", "options"]
    cache_seconds = 60

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if request.method in ("GET", "HEAD") and response.status_code == 200:
            response["Cache-Control"] = f"public, max-age={self.cache_seconds}"
        return response
