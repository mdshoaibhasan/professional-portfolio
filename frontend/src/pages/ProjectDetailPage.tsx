import { useParams } from "react-router";
import { BuildNotice } from "@/components/layout/BuildNotice";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";
import { findProject } from "@/content/projects";
import NotFoundPage from "@/pages/NotFoundPage";

export default function ProjectDetailPage() {
  const project = findProject(useParams().slug);
  if (!project) return <NotFoundPage />;

  return (
    <>
      <Seo title={`${project.title} case study`} description={project.summary} />
      <PageHeader label="Case study" title={project.title}>
        {project.summary}
      </PageHeader>
      <BuildNotice />
    </>
  );
}
