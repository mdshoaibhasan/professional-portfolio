from django.contrib import admin

from .models import ProcessStep, Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["title", "tier", "is_active", "order"]
    list_editable = ["is_active", "order"]
    list_filter = ["tier", "is_active"]
    search_fields = ["title", "summary", "description"]
    prepopulated_fields = {"slug": ["title"]}


@admin.register(ProcessStep)
class ProcessStepAdmin(admin.ModelAdmin):
    list_display = ["title", "order"]
    list_editable = ["order"]
