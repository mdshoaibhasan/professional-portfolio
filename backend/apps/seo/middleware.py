from django.conf import settings


class NoIndexMiddleware:
    """With SEO_ALLOW_INDEXING off (demo deployments), ask search engines not to index anything (D-045).

    A header rather than a robots.txt block: crawlers that are blocked never see "noindex" and may still list
    the bare URLs. This hides the site from search results only; it does not make it private.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if not settings.SEO_ALLOW_INDEXING:
            response["X-Robots-Tag"] = "noindex, nofollow"
        return response
