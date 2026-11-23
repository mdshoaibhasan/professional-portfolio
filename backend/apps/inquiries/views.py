import logging

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Inquiry
from .serializers import InquiryCreateSerializer
from .services import (
    TokenStatus,
    check_form_token,
    client_ip,
    consume_form_token,
    hash_ip,
    issue_form_token,
    notify_owner,
)

logger = logging.getLogger(__name__)

SUCCESS = {"detail": "Thanks — your message has been received. I'll reply by email."}
TOKEN_REJECTED = {"form_token": ["This form has expired. Please reload the page and try again."]}


class FormTokenView(APIView):
    """GET a short-lived signed token for the contact form. Never cached."""

    permission_classes = [AllowAny]
    authentication_classes = []
    http_method_names = ["get", "options"]

    def get(self, request):
        response = Response({"token": issue_form_token()})
        response["Cache-Control"] = "no-store"
        return response


class InquiryCreateView(APIView):
    """POST a new inquiry. Saves first; the owner notification can fail without failing the request."""

    permission_classes = [AllowAny]
    # No session auth: anonymous visitors only, and the signed form token replaces CSRF protection
    # (a cross-site page cannot read the token because the API sends no CORS headers).
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "inquiries"
    http_method_names = ["post", "options"]

    def post(self, request):
        serializer = InquiryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        honeypot = data.pop("website", "")
        token = data.pop("form_token")
        token_status = check_form_token(token)

        # Consumed only after the fields validate, so a visitor can fix a typo and resend the same token.
        # A reused token gets the same answer as an expired one; the form then fetches a fresh token.
        if token_status == TokenStatus.INVALID or not consume_form_token(token):
            return Response(TOKEN_REJECTED, status=status.HTTP_400_BAD_REQUEST)

        spam_reason = "honeypot" if honeypot else ("too_fast" if token_status == TokenStatus.TOO_FAST else "")
        with transaction.atomic():
            inquiry = Inquiry.objects.create(
                **data,
                status=Inquiry.Status.SPAM if spam_reason else Inquiry.Status.NEW,
                spam_reason=spam_reason,
                ip_hash=hash_ip(client_ip(request)),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:200],
            )

        if spam_reason:
            # Same response as a real submission, so bots learn nothing. No notification.
            logger.info("Inquiry %s stored as spam (%s)", inquiry.pk, spam_reason)
        else:
            notify_owner(inquiry)
        return Response(SUCCESS, status=status.HTTP_201_CREATED)
