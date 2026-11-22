import type { ServiceSummary } from "@/types/content";

// TODO(content): owner to review service scope and wording (CONTENT_CHECKLIST G)
export const services: ServiceSummary[] = [
  {
    slug: "website-development",
    title: "Website Development",
    tier: "primary",
    summary: "Fast, responsive business and personal websites with clean, maintainable code.",
  },
  {
    slug: "web-app-api-development",
    title: "Web Application & API Development",
    tier: "primary",
    summary:
      "Django and Django REST Framework applications: data models, admin, authentication and APIs.",
  },
  {
    slug: "mobile-app-development",
    title: "Mobile Application Development",
    tier: "primary",
    summary: "Simple Flutter apps and MVPs connected to a Django backend.",
  },
  {
    slug: "social-media-management",
    title: "Social Media Page Management",
    tier: "secondary",
    summary: "Consistent, well-organised management of business social media pages.",
  },
  {
    slug: "social-media-advertising",
    title: "Social Media Boosting & Advertising",
    tier: "secondary",
    summary: "Planning and running boosted posts and ad campaigns on social platforms.",
  },
];

export function findService(slug: string | undefined): ServiceSummary | undefined {
  return services.find((service) => service.slug === slug);
}
