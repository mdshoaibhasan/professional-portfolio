from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from apps.seo import views as seo

urlpatterns = [
    path(f"{settings.ADMIN_PATH}/", admin.site.urls),
    path("api/v1/", include("config.api_urls")),
    path("sitemap.xml", seo.sitemap, name="sitemap"),
    path("robots.txt", seo.robots, name="robots"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Last: every other URL is a frontend route, served as the SPA shell (404 status for unknown pages).
# API, static and media paths never fall through to it, so they keep plain 404s instead of an HTML page.
urlpatterns += [re_path(r"^(?!api/|static/|media/)(?P<path>.*)$", seo.spa_shell, name="spa-shell")]
