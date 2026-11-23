from django.contrib import admin

from .models import Inquiry


def _status_action(status: Inquiry.Status):
    @admin.action(description=f"Mark selected as {status.label.lower()}", permissions=["change"])
    def action(modeladmin, request, queryset):
        updated = queryset.update(status=status)
        modeladmin.message_user(request, f"{updated} inquiry(s) marked as {status.label.lower()}.")

    action.__name__ = f"mark_{status.value}"
    return action


SUBMITTED = ["name", "email", "company", "whatsapp", "service", "message", "budget", "timeline"]
TECHNICAL = ["spam_reason", "ip_hash", "user_agent", "created_at", "notified_at", "notify_error"]


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    """Submitted data is read-only; only the status is edited."""

    list_display = ["name", "email", "service", "status", "created_at", "notified_at"]
    list_filter = ["status", "service", "created_at"]
    search_fields = ["name", "email", "company", "message"]
    date_hierarchy = "created_at"
    readonly_fields = [*SUBMITTED, *TECHNICAL]
    actions = [_status_action(status) for status in Inquiry.Status]
    fieldsets = [
        (None, {"fields": ["status"]}),
        ("Submitted", {"fields": SUBMITTED}),
        ("Technical", {"fields": TECHNICAL, "classes": ["collapse"]}),
    ]

    def has_add_permission(self, request):
        return False
