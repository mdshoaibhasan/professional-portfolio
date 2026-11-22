from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Portfolio administration"
admin.site.site_title = "Portfolio admin"

urlpatterns = [
    path(f"{settings.ADMIN_PATH}/", admin.site.urls),
    path("api/v1/", include("config.api_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
