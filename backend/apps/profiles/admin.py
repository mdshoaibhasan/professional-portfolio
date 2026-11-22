from django.contrib import admin

from .models import Certification, Education, Experience, Profile, Skill, SocialLink


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Singleton: one profile, never deleted."""

    def has_add_permission(self, request):
        return not Profile.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "level_label", "order"]
    list_editable = ["order"]
    list_filter = ["category"]


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ["__str__", "organization", "start_date", "end_date", "is_current", "order"]
    list_editable = ["order"]


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ["degree", "institution", "status_label", "order"]


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ["__str__", "issuer", "issue_date", "order"]


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ["platform", "url", "order"]
    list_editable = ["order"]
