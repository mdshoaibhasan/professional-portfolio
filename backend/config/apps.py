from django.contrib.admin.apps import AdminConfig


class PortfolioAdminConfig(AdminConfig):
    """Replaces django.contrib.admin so every @admin.register uses the hardened site."""

    default_site = "config.admin_site.PortfolioAdminSite"
