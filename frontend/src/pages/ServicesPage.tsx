import { Link } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";
import { services } from "@/content/services";

export default function ServicesPage() {
  const primary = services.filter((service) => service.tier === "primary");
  const secondary = services.filter((service) => service.tier === "secondary");
  return (
    <>
      <Seo
        title="Services"
        description="Website, web application, API and mobile app development."
      />
      <PageHeader label="Services" title="What I can build for you" />
      <div className="container-page py-section">
        <ul className="grid gap-5 md:grid-cols-3">
          {primary.map((service) => (
            <li key={service.slug} className="rounded-lg border border-line bg-surface p-6">
              <h2 className="text-h3">
                <Link
                  className="text-fg no-underline hover:underline"
                  to={`/services/${service.slug}`}
                >
                  {service.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted">{service.summary}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-dashed border-line-strong px-5 py-4">
          <p className="label-mono text-muted">Also offered</p>
          {secondary.map((service) => (
            <Link key={service.slug} to={`/services/${service.slug}`}>
              {service.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
