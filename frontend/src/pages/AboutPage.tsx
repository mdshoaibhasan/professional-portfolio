import { BuildNotice } from "@/components/layout/BuildNotice";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";

export default function AboutPage() {
  return (
    <>
      <Seo title="About" description="Background, skills and approach." />
      <PageHeader label="About" title="About me" />
      <BuildNotice />
    </>
  );
}
