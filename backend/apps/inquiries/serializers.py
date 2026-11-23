import re

from rest_framework import serializers

from apps.services.models import Service

from .models import Inquiry

_WHATSAPP = re.compile(r"^\+?[0-9 ]{6,20}$")


def _single_line(value: str) -> str:
    if "\n" in value or "\r" in value:
        raise serializers.ValidationError("Must be a single line.")
    return value


class InquiryCreateSerializer(serializers.ModelSerializer):
    """Validates public submissions. Limits mirror frontend/src/features/contact/schema.ts."""

    name = serializers.CharField(min_length=2, max_length=100, validators=[_single_line])
    email = serializers.EmailField(max_length=254)
    company = serializers.CharField(
        max_length=120, required=False, allow_blank=True, validators=[_single_line]
    )
    whatsapp = serializers.CharField(max_length=24, required=False, allow_blank=True)
    service = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Service.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )
    message = serializers.CharField(min_length=20, max_length=5000)
    budget = serializers.CharField(max_length=80, required=False, allow_blank=True, validators=[_single_line])
    timeline = serializers.ChoiceField(choices=Inquiry.Timeline.choices, required=False, allow_blank=True)

    # Anti-spam fields; never stored.
    form_token = serializers.CharField(write_only=True, max_length=200)
    website = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=200)

    class Meta:
        model = Inquiry
        fields = [
            "name",
            "email",
            "company",
            "whatsapp",
            "service",
            "message",
            "budget",
            "timeline",
            "form_token",
            "website",
        ]

    def validate_whatsapp(self, value: str) -> str:
        value = value.strip()
        if value and not _WHATSAPP.match(value):
            raise serializers.ValidationError("Use digits, spaces and an optional leading +.")
        return value

    def validate_message(self, value: str) -> str:
        return value.strip()
