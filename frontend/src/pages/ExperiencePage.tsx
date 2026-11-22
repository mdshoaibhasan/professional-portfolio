import { BuildNotice } from "@/components/layout/BuildNotice";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";

export default function ExperiencePage() {
  return (
    <>
      <Seo title="Experience" description="Professional experience, education and certification." />
      <PageHeader label="Experience" title="Experience & education" />
      <BuildNotice />
    </>
  );
}
