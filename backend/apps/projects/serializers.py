"""Shapes mirror frontend/src/types/content.ts (ProjectDetail)."""

from rest_framework import serializers

from apps.text import lines, or_none, paragraphs

from .models import CaseStudyPoint, CaseStudySection, Project, ProjectSpec


class ProjectSpecSerializer(serializers.ModelSerializer):
    value = serializers.SerializerMethodField()

    class Meta:
        model = ProjectSpec
        fields = ["label", "value"]

    def get_value(self, obj: ProjectSpec) -> str | None:
        return or_none(obj.value)


class CaseStudyPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudyPoint
        fields = ["title", "text"]


class CaseStudySectionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="anchor")
    body = serializers.SerializerMethodField()
    points = CaseStudyPointSerializer(many=True)

    class Meta:
        model = CaseStudySection
        fields = ["id", "title", "body", "points"]

    def get_body(self, obj: CaseStudySection) -> list[str]:
        return paragraphs(obj.body)


class ProjectListSerializer(serializers.ModelSerializer):
    technologies = serializers.SerializerMethodField()
    highlights = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    period = serializers.SerializerMethodField()
    repo_url = serializers.SerializerMethodField()
    live_url = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()
    specs = ProjectSpecSerializer(many=True)

    class Meta:
        model = Project
        fields = [
            "slug",
            "title",
            "summary",
            "status",
            "is_featured",
            "technologies",
            "role",
            "period",
            "repo_url",
            "live_url",
            "cover_image",
            "specs",
            "highlights",
        ]

    def get_technologies(self, obj: Project) -> list[str]:
        return lines(obj.technologies)

    def get_highlights(self, obj: Project) -> list[str]:
        return lines(obj.highlights)

    def get_role(self, obj: Project) -> str | None:
        return or_none(obj.role)

    def get_period(self, obj: Project) -> str | None:
        return or_none(obj.period)

    def get_repo_url(self, obj: Project) -> str | None:
        return or_none(obj.repo_url)

    def get_live_url(self, obj: Project) -> str | None:
        return or_none(obj.live_url)

    def get_cover_image(self, obj: Project) -> str | None:
        return obj.cover_image.url if obj.cover_image else None


class ProjectDetailSerializer(ProjectListSerializer):
    sections = CaseStudySectionSerializer(many=True)

    class Meta(ProjectListSerializer.Meta):
        fields = [*ProjectListSerializer.Meta.fields, "sections"]
