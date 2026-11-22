import { useParams } from "react-router";
import { BuildNotice } from "@/components/layout/BuildNotice";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";
import { findService } from "@/content/services";
import NotFoundPage from "@/pages/NotFoundPage";

export default function ServiceDetailPage() {
  const service = findService(useParams().slug);
  if (!service) return <NotFoundPage />;

  return (
    <>
      <Seo title={service.title} description={service.summary} />
      <PageHeader label="Service" title={service.title}>
        {service.summary}
      </PageHeader>
      <BuildNotice />
    </>
  );
}
