from django.db.models import Prefetch
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.public_api import PublicReadOnlyMixin

from .models import CaseStudySection, Project
from .serializers import ProjectDetailSerializer, ProjectListSerializer


class ProjectViewSet(PublicReadOnlyMixin, ReadOnlyModelViewSet):
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Project.objects.filter(is_published=True).prefetch_related("specs")
        if self.action == "retrieve":
            queryset = queryset.prefetch_related(
                Prefetch("sections", queryset=CaseStudySection.objects.prefetch_related("points"))
            )
        return queryset

    def get_serializer_class(self):
        return ProjectDetailSerializer if self.action == "retrieve" else ProjectListSerializer
