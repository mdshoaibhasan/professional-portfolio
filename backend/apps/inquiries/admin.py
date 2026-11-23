from django.contrib import admin

from .models import Inquiry

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
    fieldsets = [
        (None, {"fields": ["status"]}),
        ("Submitted", {"fields": SUBMITTED}),
        ("Technical", {"fields": TECHNICAL, "classes": ["collapse"]}),
    ]

    def has_add_permission(self, request):
        return False
