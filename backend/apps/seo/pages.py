"""Per-URL metadata for the SPA shell (D-006, D-038).

Descriptions live only here: crawlers fetch each URL directly and read the server-rendered <head>, so the
React app only keeps the tab title up to date during in-app navigation. Paths must match
frontend/src/app/router.tsx.
"""

from dataclasses import dataclass, field

from django.conf import settings

from apps.profiles.models import Profile, Skill, SocialLink
from apps.projects.models import Project
from apps.services.models import Service
from apps.text import lines

DEFAULT_IMAGE = "/og-default.png"  # frontend/public/og-default.png, 1200×630

# path → (page title or None for the home page, description)
STATIC_PAGES: dict[str, tuple[str | None, str]] = {
    "/": (
        None,
        "Software Engineer building practical software solutions: websites, web applications, backend "
        "systems and APIs. Available for freelance projects.",
    ),
    "/about": (
        "About",
        "Software Engineer and Computer Science and Engineering student in Bangladesh — background, skills "
        "and approach.",
    ),
    "/projects": ("Projects", "Selected independent software projects and case studies."),
    "/services": (
        "Services",
        "Software development services — web development, web applications, backend and API development, "
        "mobile apps and custom business software — plus digital marketing and social media management.",
    ),
    "/experience": (
        "Experience",
        "Professional experience, education in Computer Science and Engineering, and certification in Python "
        "web application development.",
    ),
    "/contact": (
        "Contact",
        "Start a project or ask a question about website, web application, API or mobile app development.",
    ),
    "/privacy": (
        "Privacy policy",
        "How this website collects, uses and protects the information you send through it.",
    ),
}
NOT_FOUND = ("Page not found", "The page you are looking for does not exist.")


@dataclass
class PageMeta:
    title: str
    description: str
    path: str
    site_name: str
    og_type: str = "website"
    image: str = DEFAULT_IMAGE
    json_ld: list[dict] = field(default_factory=list)
    status: int = 200

    @property
    def canonical(self) -> str:
        return absolute(self.path)

    @property
    def image_url(self) -> str:
        return absolute(self.image)


def absolute(path: str) -> str:
    return settings.SITE_URL.rstrip("/") + path


def normalize(path: str) -> str:
    return "/" + path.strip("/") if path.strip("/") else "/"


def resolve(raw_path: str) -> PageMeta:
    profile = Profile.load()
    path = normalize(raw_path)
    name = profile.name.strip() or None
    site_name = name or profile.headline

    def page_title(title: str | None) -> str:
        if title is None:
            return f"{name} — {profile.headline}" if name else profile.headline
        return f"{title} — {name}" if name else title

    person = _person(profile, name)

    if path in STATIC_PAGES:
        title, description = STATIC_PAGES[path]
        meta = PageMeta(page_title(title), description, path, site_name)
        if path == "/" and person:
            meta.json_ld = [{"@type": "WebSite", "name": site_name, "url": absolute("/")}, person]
        elif path == "/about" and person:
            meta.json_ld = [{"@type": "ProfilePage", "mainEntity": person}]
        return meta

    section, _, slug = path.strip("/").partition("/")
    if slug and "/" not in slug:
        if section == "projects":
            project = Project.objects.filter(slug=slug, is_published=True).first()
            if project:
                return _project_meta(project, path, site_name, page_title, person)
        if section == "services":
            service = Service.objects.filter(slug=slug, is_active=True).first()
            if service:
                return _service_meta(service, path, site_name, page_title, person)

    title, description = NOT_FOUND
    return PageMeta(page_title(title), description, path, site_name, status=404)


def _person(profile: Profile, name: str | None) -> dict | None:
    """Schema.org Person, only from facts the owner has supplied; no name, no Person."""
    if not name:
        return None
    person = {"@type": "Person", "name": name, "jobTitle": profile.headline, "url": absolute("/")}
    if profile.short_bio.strip():
        person["description"] = profile.short_bio.strip()
    same_as = [link.url for link in SocialLink.objects.all()]
    if same_as:
        person["sameAs"] = same_as
    known = list(Skill.objects.filter(tier=Skill.Tier.USE).values_list("name", flat=True))
    if known:
        person["knowsAbout"] = known
    return person


def _project_meta(project: Project, path, site_name, page_title, person) -> PageMeta:
    description = project.seo_description.strip() or project.summary
    work = {
        "@type": "CreativeWork",
        "name": project.title,
        "description": description,
        "url": absolute(path),
    }
    technologies = lines(project.technologies)
    if technologies:
        work["keywords"] = ", ".join(technologies)
    if person:
        work["creator"] = person
    return PageMeta(
        page_title(project.seo_title.strip() or f"{project.title} case study"),
        description,
        path,
        site_name,
        og_type="article",
        image=project.cover_image.url if project.cover_image else DEFAULT_IMAGE,
        json_ld=[work],
    )


def _service_meta(service: Service, path, site_name, page_title, person) -> PageMeta:
    description = service.seo_description.strip() or service.summary
    offer = {"@type": "Service", "name": service.title, "description": description, "url": absolute(path)}
    if person:
        offer["provider"] = person
    return PageMeta(
        page_title(service.seo_title.strip() or service.title),
        description,
        path,
        site_name,
        json_ld=[offer],
    )
