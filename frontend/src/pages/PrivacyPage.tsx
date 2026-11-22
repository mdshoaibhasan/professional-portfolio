import { BuildNotice } from "@/components/layout/BuildNotice";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";

export default function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy policy" description="How this website handles your information." />
      <PageHeader label="Legal" title="Privacy policy" />
      <BuildNotice />
    </>
  );
}
