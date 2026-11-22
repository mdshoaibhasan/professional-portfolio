import { Link } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";
import { projects } from "@/content/projects";

export default function ProjectsPage() {
  return (
    <>
      <Seo title="Projects" description="Selected software projects and case studies." />
      <PageHeader label="Projects" title="Selected work" />
      <div className="container-page py-section">
        <ul className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug} className="rounded-lg border border-line bg-surface p-6">
              <h2 className="text-h3">
                <Link
                  className="text-fg no-underline hover:underline"
                  to={`/projects/${project.slug}`}
                >
                  {project.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted">{project.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
