import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SpecList } from "@/components/ui/SpecList";
import { Tag, TagList } from "@/components/ui/Tag";
import type { ProjectListItem, ProjectStatus } from "@/types/content";

const statusLabel: Record<ProjectStatus, string> = {
  "pre-launch": "Pre-launch",
  live: "Live",
  archived: "Archived",
};

export function ProjectStatusTag({ status }: { status: ProjectStatus }) {
  return <Tag tone={status === "pre-launch" ? "warning" : "neutral"}>{statusLabel[status]}</Tag>;
}

/** Large featured card with spec sheet. Used once per page, with the page's single glow. */
export function FeaturedProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <article className="glow-behind">
      <div className="relative rounded-lg border border-line bg-surface p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <SectionLabel index="Featured">Case study</SectionLabel>
          <ProjectStatusTag status={project.status} />
        </div>
        <h2 className="mt-4 text-h3">{project.title}</h2>
        <p className="mt-2 text-sm text-muted">{project.summary}</p>
        <div className="mt-5">
          <SpecList
            items={[
              ...project.specs.filter((spec) => spec.label !== "Hosting"),
              { label: "Highlights", value: project.highlights.join(" · ") },
            ]}
          />
        </div>
        <Link
          to={`/projects/${project.slug}`}
          className="mt-6 inline-flex min-h-11 items-center gap-2 font-display font-medium"
        >
          Read the case study <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

/** Standard project card; the whole card is clickable via a stretched link. */
export function ProjectCard({
  project,
  headingLevel = 3,
}: {
  project: ProjectListItem;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="relative flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors duration-150 hover:border-line-strong hover:bg-raised">
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono text-muted">{project.period}</p>
        <ProjectStatusTag status={project.status} />
      </div>
      <Heading className="mt-3 text-h3">
        <Link
          to={`/projects/${project.slug}`}
          className="text-fg no-underline after:absolute after:inset-0 after:rounded-lg"
        >
          {project.title}
        </Link>
      </Heading>
      <p className="mt-2 mb-5 text-sm text-muted">{project.summary}</p>
      <div className="mt-auto">
        <TagList items={project.technologies} />
      </div>
    </article>
  );
}
