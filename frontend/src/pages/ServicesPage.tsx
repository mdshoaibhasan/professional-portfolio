import { ContactCta } from "@/components/sections/ContactCta";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { SecondaryServices, ServiceCard } from "@/components/sections/ServiceCards";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Seo } from "@/components/ui/Seo";
import { useLoaderData } from "react-router";
import type { servicesLoader } from "@/app/loaders";

export default function ServicesPage() {
  const services = useLoaderData<typeof servicesLoader>();
  const primary = services.filter((service) => service.tier === "primary");
  const secondary = services.filter((service) => service.tier === "secondary");
  return (
    <>
      <Seo title="Services" />
      <PageHeader label="Services" title="What I can build for you">
        Software development is the core of my work. Each project starts with a written scope, so
        you know exactly what is included before anything is built.
      </PageHeader>
      <div className="container-page py-section">
        <section aria-labelledby="dev-services">
          <h2 id="dev-services" className="label-mono text-accent-text">
            Software development
          </h2>
          <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {primary.map((service) => (
              <li key={service.slug}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </section>
        {secondary.length > 0 && (
          <section aria-labelledby="marketing-services" className="mt-12">
            <h2 id="marketing-services" className="label-mono text-muted">
              Digital marketing · secondary
            </h2>
            <SecondaryServices services={secondary} label={null} />
          </section>
        )}
      </div>
      <Section id="process" label="Process" title="How a project runs">
        <ProcessSteps />
      </Section>
      <ContactCta />
    </>
  );
}
