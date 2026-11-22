from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.public_api import PublicReadOnlyMixin

from .models import Service
from .serializers import ServiceSerializer


class ServiceViewSet(PublicReadOnlyMixin, ReadOnlyModelViewSet):
    lookup_field = "slug"
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
