"""DRF throttles that identify visitors with config.client_ip instead of DRF's X-Forwarded-For logic."""

from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle

from config.client_ip import client_ip


class ClientIpMixin:
    def get_ident(self, request):
        return client_ip(request)


class AnonThrottle(ClientIpMixin, AnonRateThrottle):
    pass


class InquiryThrottle(ClientIpMixin, ScopedRateThrottle):
    pass
