import { BuildNotice } from "@/components/layout/BuildNotice";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";

export default function ContactPage() {
  return (
    <>
      <Seo title="Contact" description="Start a project or get in touch." />
      <PageHeader label="Contact" title="Start a project">
        Tell me about what you want to build.
      </PageHeader>
      <BuildNotice />
    </>
  );
}
