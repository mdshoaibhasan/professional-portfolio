"""Shapes mirror frontend/src/types/content.ts. Missing owner facts are serialized as null (D-018)."""

from rest_framework import serializers

from apps.text import lines, month_year, or_none, paragraphs

from .models import Certification, Education, Experience, Profile, Skill, SocialLink


class ProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    short_bio = serializers.SerializerMethodField()
    long_bio = serializers.SerializerMethodField()
    location_public = serializers.SerializerMethodField()
    email_public = serializers.SerializerMethodField()
    whatsapp_public = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    strengths = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "name",
            "headline",
            "short_bio",
            "long_bio",
            "location_public",
            "email_public",
            "whatsapp_public",
            "photo",
            "open_to_work",
            "availability_note",
            "strengths",
        ]

    def get_name(self, obj: Profile) -> str | None:
        return or_none(obj.name)

    def get_short_bio(self, obj: Profile) -> str | None:
        return or_none(obj.short_bio)

    def get_long_bio(self, obj: Profile) -> list[str] | None:
        return paragraphs(obj.long_bio) or None

    def get_location_public(self, obj: Profile) -> str | None:
        return or_none(obj.location_public)

    def get_email_public(self, obj: Profile) -> str | None:
        return or_none(obj.email_public)

    def get_whatsapp_public(self, obj: Profile) -> str | None:
        return or_none(obj.whatsapp_public)

    def get_photo(self, obj: Profile) -> str | None:
        return obj.photo.url if obj.photo else None

    def get_strengths(self, obj: Profile) -> list[str]:
        return lines(obj.strengths)


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ["platform", "url"]


class SkillSerializer(serializers.ModelSerializer):
    level_label = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = ["name", "category", "level_label"]

    def get_level_label(self, obj: Skill) -> str | None:
        return or_none(obj.level_label)


class ExperienceSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()
    highlights = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = ["title", "organization", "start_date", "end_date", "is_current", "summary", "highlights"]

    def get_title(self, obj: Experience) -> str | None:
        return or_none(obj.title)

    def get_organization(self, obj: Experience) -> str | None:
        return or_none(obj.organization)

    def get_start_date(self, obj: Experience) -> str | None:
        return month_year(obj.start_date)

    def get_end_date(self, obj: Experience) -> str | None:
        return month_year(obj.end_date)

    def get_highlights(self, obj: Experience) -> list[str]:
        return lines(obj.highlights)


class EducationSerializer(serializers.ModelSerializer):
    institution = serializers.SerializerMethodField()
    start_year = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = ["institution", "degree", "start_year", "status_label"]

    def get_institution(self, obj: Education) -> str | None:
        return or_none(obj.institution)

    def get_start_year(self, obj: Education) -> str | None:
        return str(obj.start_year) if obj.start_year else None

    def get_status_label(self, obj: Education) -> str | None:
        return or_none(obj.status_label)


class CertificationSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    issuer = serializers.SerializerMethodField()
    issue_date = serializers.SerializerMethodField()
    credential_url = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = ["name", "issuer", "issue_date", "credential_url", "topic"]

    def get_name(self, obj: Certification) -> str | None:
        return or_none(obj.name)

    def get_issuer(self, obj: Certification) -> str | None:
        return or_none(obj.issuer)

    def get_issue_date(self, obj: Certification) -> str | None:
        return month_year(obj.issue_date)

    def get_credential_url(self, obj: Certification) -> str | None:
        return or_none(obj.credential_url)
