import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { ServiceDetail } from "@/types/content";

export function ServiceCard({
  service,
  headingLevel = 3,
}: {
  service: ServiceDetail;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="relative flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors duration-150 hover:border-line-strong hover:bg-raised">
      <Heading className="text-h3">
        <Link
          to={`/services/${service.slug}`}
          className="text-fg no-underline after:absolute after:inset-0 after:rounded-lg"
        >
          {service.title}
        </Link>
      </Heading>
      <p className="mt-2 mb-6 text-sm text-muted">{service.summary}</p>
      <p className="mt-auto inline-flex items-center gap-2 font-display text-sm font-medium text-primary-text">
        Scope &amp; details <ArrowRight size={16} aria-hidden="true" />
      </p>
    </article>
  );
}

/** Secondary (social media) services in a deliberately compact row. */
export function SecondaryServices({ services }: { services: ServiceDetail[] }) {
  if (services.length === 0) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-dashed border-line-strong px-5 py-4">
      <p className="label-mono text-muted">Also offered</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {services.map((service) => (
          <li key={service.slug}>
            <Link to={`/services/${service.slug}`}>{service.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
