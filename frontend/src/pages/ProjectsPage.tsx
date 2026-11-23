import { ContactCta } from "@/components/sections/ContactCta";
import { ProjectCard } from "@/components/sections/ProjectCards";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";
import { Todo } from "@/components/ui/Todo";
import { useLoaderData } from "react-router";
import type { projectsLoader } from "@/app/loaders";

export default function ProjectsPage() {
  const projects = useLoaderData<typeof projectsLoader>();
  return (
    <>
      <Seo
        title="Projects"
        description="Selected independent software projects and case studies."
      />
      <PageHeader label="Projects" title="Selected work">
        Case studies written from the actual source code — what was built, how, and why.
      </PageHeader>
      <div className="container-page py-section">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} headingLevel={2} />
            </li>
          ))}
        </ul>
        {projects.length < 3 && (
          <p className="mt-5 text-sm">
            <Todo>add 2–3 more projects (CONTENT_CHECKLIST E)</Todo>
          </p>
        )}
      </div>
      <ContactCta />
    </>
  );
}
