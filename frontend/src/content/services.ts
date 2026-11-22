import type { ServiceDetail } from "@/types/content";

/**
 * Service descriptions. Draft wording for owner review (CONTENT_CHECKLIST G):
 * scope, exclusions and pricing approach must be confirmed before launch.
 * Rule: describe what is delivered; never promise results or claim unverified experience.
 */
export const services: ServiceDetail[] = [
  {
    slug: "website-development",
    title: "Website Development",
    tier: "primary",
    summary: "Fast, responsive business and personal websites with clean, maintainable code.",
    description:
      "A clear, fast and professional website for an individual, small business or organisation — built to work well on phones first, and easy to keep up to date.",
    ideal_for:
      "Professionals, small businesses and organisations that need a reliable online presence.",
    includes: [
      "Responsive layout for phones, tablets and desktops",
      "Pages and sections agreed in the written scope",
      "Contact form or inquiry links",
      "Basic on-page SEO: page titles, descriptions and a sitemap",
      "Help with domain, hosting setup and deployment",
      "Handover notes so you know how the site is maintained",
    ],
    excludes: [
      "Copywriting and photography, unless agreed in the scope",
      "Logo and brand identity design",
      "Hosting and domain fees, which you pay to the provider directly",
    ],
    benefits: [
      "Loads quickly, including on mobile connections",
      "Clean structure that is easy to extend later",
      "You own the code and the content",
    ],
    scope_note: null,
  },
  {
    slug: "web-app-api-development",
    title: "Web Application & API Development",
    tier: "primary",
    summary:
      "Django and Django REST Framework applications: data models, admin, authentication and APIs.",
    description:
      "Backend-driven web applications built with Python, Django and Django REST Framework — from the data model and admin panel to secure, documented APIs that web or mobile front-ends can use.",
    ideal_for:
      "Internal tools, dashboards, data-driven websites, and backends for web or mobile apps.",
    includes: [
      "Data modelling and database design",
      "Django admin for managing your data",
      "REST API endpoints with validation and authentication",
      "Automated tests for the core logic",
      "Deployment guidance and technical documentation",
    ],
    excludes: [
      "Large-scale distributed infrastructure",
      "Native mobile apps (see Mobile Application Development)",
    ],
    benefits: [
      "Maintainable, conventional Django structure",
      "Secure defaults: validation, permissions and safe configuration",
      "A documented API that other developers can build on",
    ],
    scope_note: null,
  },
  {
    slug: "mobile-app-development",
    title: "Mobile Application Development",
    tier: "primary",
    summary: "Simple Flutter apps and MVPs connected to a Django backend.",
    description:
      "Small, focused mobile apps built with Flutter, connected to a Django REST API — a practical way to test an idea or give existing customers a simple app.",
    ideal_for: "Prototypes, MVPs and small apps with a clear, limited set of features.",
    includes: [
      "Flutter app with the screens agreed in the scope",
      "Integration with a Django REST API (new or existing)",
      "Android build for testing and release",
    ],
    excludes: [
      "Large or highly complex apps",
      "Advanced native device features",
      "App store marketing",
    ],
    benefits: [
      "One backend serving both the website and the app",
      "A working version early, so you can test the idea with real users",
    ],
    scope_note:
      "My Flutter and Dart experience is at a foundational level, so I take on small, well-scoped mobile projects.",
  },
  {
    slug: "social-media-management",
    title: "Social Media Page Management",
    tier: "secondary",
    summary: "Consistent, well-organised management of business social media pages.",
    description:
      "Organised, consistent management of your business pages, so they stay active and customers get timely responses.",
    ideal_for: "Small businesses that want an active, professional page without managing it daily.",
    includes: [
      "Page setup and profile information review",
      "Content calendar planned with you",
      "Scheduling and posting of agreed content",
      "Responding to messages and comments within agreed limits",
      "A short monthly summary of page activity",
    ],
    excludes: ["Paid advertising budget", "Professional photo and video production"],
    benefits: ["A consistent, professional presence", "Faster, more reliable replies to customers"],
    scope_note: null,
  },
  {
    slug: "social-media-advertising",
    title: "Social Media Boosting & Advertising",
    tier: "secondary",
    summary: "Planning and running boosted posts and ad campaigns on social platforms.",
    description:
      "Help planning and running boosted posts and ad campaigns, with the budget and audience agreed with you in advance.",
    ideal_for: "Businesses that want to promote a post, offer or page to a defined local audience.",
    includes: [
      "Campaign setup on the agreed platform",
      "Audience and budget planning with you",
      "Boosting selected posts",
      "Monitoring and adjusting during the campaign",
      "A summary of the results reported by the platform",
    ],
    excludes: [
      "Ad spend, which is paid by you directly to the platform",
      "Guaranteed sales, leads or follower numbers",
    ],
    benefits: ["Clear budget control", "Transparent reporting based on platform data"],
    scope_note: null,
  },
];

export function findService(slug: string | undefined): ServiceDetail | undefined {
  return services.find((service) => service.slug === slug);
}
