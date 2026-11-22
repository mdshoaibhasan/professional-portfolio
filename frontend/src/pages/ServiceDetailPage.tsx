import { ArrowLeft, ArrowRight, Check, Info, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLoaderData } from "react-router";
import type { serviceLoader } from "@/app/loaders";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Seo } from "@/components/ui/Seo";

function ListBlock({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-fg-secondary">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-0.5 shrink-0">{icon}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { service, others } = useLoaderData<typeof serviceLoader>();
  const contactLink = `/contact?service=${service.slug}`;

  return (
    <>
      <Seo title={service.title} description={service.description} />
      <PageHeader
        label={service.tier === "primary" ? "Service" : "Additional service"}
        title={service.title}
      >
        {service.description}
      </PageHeader>

      <div className="container-page py-section">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm text-muted no-underline hover:text-fg"
        >
          <ArrowLeft size={16} aria-hidden="true" /> All services
        </Link>

        <p className="mt-8 max-w-[65ch] text-body-lg text-fg-secondary">
          <span className="mr-2 label-mono text-muted">Best for</span>
          {service.ideal_for}
        </p>

        {service.scope_note && (
          <p className="mt-6 flex max-w-[65ch] gap-3 rounded-lg border border-line-strong bg-raised p-4 text-sm text-fg-secondary">
            <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary-text" />
            {service.scope_note}
          </p>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <ListBlock
            title="What's included"
            items={service.includes}
            icon={<Check size={16} aria-hidden="true" className="text-success" />}
          />
          <ListBlock
            title="Not included"
            items={service.excludes}
            icon={<Minus size={16} aria-hidden="true" className="text-muted" />}
          />
          <ListBlock
            title="What you get"
            items={service.benefits}
            icon={<ArrowRight size={16} aria-hidden="true" className="text-primary-text" />}
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <ButtonLink to={contactLink}>
            Discuss your project <ArrowRight size={18} aria-hidden="true" />
          </ButtonLink>
          <p className="text-sm text-muted">
            Pricing is quoted per project after we agree the scope.
          </p>
        </div>

        <nav aria-label="Other services" className="mt-16 border-t border-line pt-8">
          <p className="label-mono text-muted">Other services</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link to={`/services/${other.slug}`}>{other.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
