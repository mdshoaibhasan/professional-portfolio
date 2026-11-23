"""The visitor's IP address, for API rate limits, the admin sign-in lockout and inquiry IP hashes (D-044).

By default only REMOTE_ADDR, the address of the TCP connection, is used. Behind a reverse proxy that is the
proxy's address, so every visitor would share one rate-limit bucket. CLIENT_IP_HEADER then names the request
header the proxy sets, e.g. "X-Real-IP" on Railway. Configure it ONLY for a proxy that overwrites the header
on every request: if visitors can set it themselves, they choose their own bucket and bypass the limits
(docs/DEPLOYMENT.md explains how to verify this).
"""

import ipaddress

from django.conf import settings


def client_ip(request) -> str:
    header = settings.CLIENT_IP_HEADER
    if header:
        candidate = request.META.get(header, "").split(",")[0].strip()
        try:
            return str(ipaddress.ip_address(candidate))
        except ValueError:
            pass  # missing or malformed: fall back to the connection address rather than trust it
    return request.META.get("REMOTE_ADDR", "")
