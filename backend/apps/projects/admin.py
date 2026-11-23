from django.contrib import admin

from .models import CaseStudyPoint, CaseStudySection, Project, ProjectSpec


class ProjectSpecInline(admin.TabularInline):
    model = ProjectSpec
    extra = 0


class CaseStudySectionInline(admin.StackedInline):
    model = CaseStudySection
    extra = 0
    show_change_link = True


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "status", "is_featured", "is_published", "order"]
    list_editable = ["is_published", "order"]
    list_filter = ["status", "is_published"]
    search_fields = ["title", "summary", "technologies"]
    prepopulated_fields = {"slug": ["title"]}
    inlines = [ProjectSpecInline, CaseStudySectionInline]


class CaseStudyPointInline(admin.StackedInline):
    model = CaseStudyPoint
    extra = 0


@admin.register(CaseStudySection)
class CaseStudySectionAdmin(admin.ModelAdmin):
    list_display = ["title", "project", "order"]
    list_filter = ["project"]
    search_fields = ["title", "body"]
    inlines = [CaseStudyPointInline]
