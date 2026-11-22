/**
 * Content types. Field names mirror the planned Django REST API (docs/ARCHITECTURE.md §3)
 * so the fixtures in src/content can be swapped for API calls in Milestone 5 (D-007).
 */

export type ServiceTier = "primary" | "secondary";

export interface ServiceSummary {
  slug: string;
  title: string;
  tier: ServiceTier;
  summary: string;
}

export type ProjectStatus = "pre-launch" | "live" | "archived";

export interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  is_featured: boolean;
  technologies: string[];
}

export interface SocialLink {
  platform: string;
  url: string;
}
