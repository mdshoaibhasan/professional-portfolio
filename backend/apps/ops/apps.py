from django.apps import AppConfig


class OpsConfig(AppConfig):
    """Operational commands (database backup and restore). No models."""

    name = "apps.ops"
    verbose_name = "Operations"
