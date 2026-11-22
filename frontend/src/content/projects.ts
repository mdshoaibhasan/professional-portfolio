import type { ProjectSummary } from "@/types/content";

/**
 * Only facts verified in docs/BACKGROUNDBRIDGE_AUDIT.md may appear here.
 * BackgroundBridge is pre-launch: never describe it as live.
 */
export const projects: ProjectSummary[] = [
  {
    slug: "backgroundbridge",
    title: "BackgroundBridge",
    summary:
      "A privacy-conscious public-information search and reporting platform, engineered for shared hosting.",
    status: "pre-launch",
    is_featured: true,
    technologies: ["Python", "Django", "Django REST Framework", "httpx (async)", "ReportLab"],
  },
  // TODO(content): other projects (CONTENT_CHECKLIST E)
];

export function findProject(slug: string | undefined): ProjectSummary | undefined {
  return projects.find((project) => project.slug === slug);
}
