import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router";
import { ContactCta } from "@/components/sections/ContactCta";
import { ProjectStatusTag } from "@/components/sections/ProjectCards";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Seo } from "@/components/ui/Seo";
import { SpecList } from "@/components/ui/SpecList";
import { TagList } from "@/components/ui/Tag";
import { Todo } from "@/components/ui/Todo";
import { findProject } from "@/content/projects";
import NotFoundPage from "@/pages/NotFoundPage";

export default function ProjectDetailPage() {
  const project = findProject(useParams().slug);
  if (!project) return <NotFoundPage />;

  return (
    <>
      <Seo title={`${project.title} case study`} description={project.summary} />

      <header className="relative isolate overflow-hidden border-b border-line py-section">
        <div aria-hidden="true" className="absolute inset-0 -z-10 hairline-grid" />
        <div className="container-page">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted no-underline hover:text-fg"
          >
            <ArrowLeft size={16} aria-hidden="true" /> All projects
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <SectionLabel>Case study</SectionLabel>
            <ProjectStatusTag status={project.status} />
          </div>
          <h1 className="mt-4 text-h1">{project.title}</h1>
          <p className="mt-6 max-w-[60ch] text-body-lg text-fg-secondary">{project.summary}</p>
        </div>
      </header>

      <div className="container-page grid gap-12 py-section lg:grid-cols-[18rem_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-line bg-surface p-5">
            <SpecList items={project.specs} />
            <div className="mt-5 border-t border-line pt-5">
              <TagList items={project.technologies} />
            </div>
            <div className="mt-5 border-t border-line pt-5 text-sm">
              {project.repo_url ? (
                <a href={project.repo_url} rel="noopener noreferrer" target="_blank">
                  Source code <ExternalLink size={14} aria-hidden="true" className="inline" />
                </a>
              ) : (
                <Todo>repository link or &ldquo;available on request&rdquo; (audit §8 Q4)</Todo>
              )}
            </div>
          </div>
          <nav aria-label="On this page" className="mt-6 hidden lg:block">
            <p className="label-mono text-muted">On this page</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {project.sections.map((section) => (
                <li key={section.id}>
                  <a
                    className="text-fg-secondary no-underline hover:text-fg"
                    href={`#${section.id}`}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0 space-y-16">
          {project.sections.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
              <p className="font-mono text-sm text-accent-text">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 id={`${section.id}-title`} className="mt-2 text-h2">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-4 max-w-[65ch] text-body-lg text-fg-secondary">
                  {paragraph}
                </p>
              ))}
              {section.points.length > 0 && (
                <ul className="mt-6 grid gap-4 md:grid-cols-2">
                  {section.points.map((point) => (
                    <li key={point.title} className="rounded-lg border border-line bg-surface p-5">
                      <h3 className="font-display text-lg font-semibold">{point.title}</h3>
                      <p className="mt-2 text-sm text-muted">{point.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section aria-labelledby="learned-title">
            <h2 id="learned-title" className="text-h2">
              What I learned
            </h2>
            <p className="mt-4 text-body-lg">
              <Todo>2–3 lessons in your own words (audit §8 Q2)</Todo>
            </p>
          </section>
        </article>
      </div>

      <ContactCta />
    </>
  );
}
