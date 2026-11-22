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
      <Seo
        title="Services"
        description="Website development, Django web applications and REST APIs, and small Flutter mobile apps — plus social media page management and advertising support."
      />
      <PageHeader label="Services" title="What I can build for you">
        Software development is the core of my work. Each project starts with a written scope, so
        you know exactly what is included before anything is built.
      </PageHeader>
      <div className="container-page py-section">
        <ul className="grid gap-5 md:grid-cols-3">
          {primary.map((service) => (
            <li key={service.slug}>
              <ServiceCard service={service} headingLevel={2} />
            </li>
          ))}
        </ul>
        <SecondaryServices services={secondary} />
      </div>
      <Section id="process" label="Process" title="How a project runs">
        <ProcessSteps />
      </Section>
      <ContactCta />
    </>
  );
}
