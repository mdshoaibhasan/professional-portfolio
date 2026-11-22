"""Shapes mirror frontend/src/types/content.ts (ServiceDetail, ProcessStep)."""

from rest_framework import serializers

from apps.text import lines, or_none

from .models import ProcessStep, Service


class ServiceSerializer(serializers.ModelSerializer):
    includes = serializers.SerializerMethodField()
    excludes = serializers.SerializerMethodField()
    benefits = serializers.SerializerMethodField()
    scope_note = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "slug",
            "title",
            "tier",
            "summary",
            "description",
            "ideal_for",
            "includes",
            "excludes",
            "benefits",
            "scope_note",
        ]

    def get_includes(self, obj: Service) -> list[str]:
        return lines(obj.includes)

    def get_excludes(self, obj: Service) -> list[str]:
        return lines(obj.excludes)

    def get_benefits(self, obj: Service) -> list[str]:
        return lines(obj.benefits)

    def get_scope_note(self, obj: Service) -> str | None:
        return or_none(obj.scope_note)


class ProcessStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessStep
        fields = ["title", "text"]
