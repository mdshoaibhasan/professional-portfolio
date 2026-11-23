import { BackgroundTimeline } from "@/components/sections/BackgroundTimeline";
import { ContactCta } from "@/components/sections/ContactCta";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Seo } from "@/components/ui/Seo";
import { useSiteContent } from "@/app/site-content";

export default function ExperiencePage() {
  const { profile } = useSiteContent();
  return (
    <>
      <Seo title="Experience" />
      <PageHeader label="Experience" title="Experience & education">
        Operational experience, a Computer Science and Engineering degree, and a certification in
        Python web application development.
      </PageHeader>

      <div className="container-page max-w-3xl py-section">
        <BackgroundTimeline headingLevel={2} />
      </div>

      <Section id="skills" label="Transferable skills" title="What operations work taught me">
        <ul className="flex flex-wrap gap-3">
          {profile.strengths.map((strength) => (
            <li
              key={strength}
              className="rounded-full border border-line-strong px-4 py-2 text-sm text-fg-secondary"
            >
              {strength}
            </li>
          ))}
        </ul>
      </Section>

      <ContactCta />
    </>
  );
}
