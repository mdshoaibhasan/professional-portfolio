"""Public API, version 1 (docs/ARCHITECTURE.md §3)."""

from django.urls import path
from rest_framework.routers import SimpleRouter

from apps.profiles.views import SiteContentView
from apps.projects.views import ProjectViewSet
from apps.services.views import ServiceViewSet

router = SimpleRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("services", ServiceViewSet, basename="service")

urlpatterns = [
    path("site/", SiteContentView.as_view(), name="site-content"),
    *router.urls,
]
