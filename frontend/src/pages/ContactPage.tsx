import { Mail, MessageCircle } from "lucide-react";
import { useLoaderData, useSearchParams } from "react-router";
import type { servicesLoader } from "@/app/loaders";
import { useSiteContent } from "@/app/site-content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";
import { Fact, Todo } from "@/components/ui/Todo";
import { ContactForm } from "@/features/contact/ContactForm";

const checklist = [
  "What you want to build, and the problem it solves",
  "Who will use it",
  "Any existing website, app, design or brand to work with",
  "Your timeline, and a budget range if you have one",
];

export default function ContactPage() {
  const { profile } = useSiteContent();
  const services = useLoaderData<typeof servicesLoader>();
  const [params] = useSearchParams();
  const service = services.find((item) => item.slug === params.get("service"));

  return (
    <>
      <Seo title="Contact" />
      <PageHeader label="Contact" title="Start a project">
        Tell me about what you want to build. I&rsquo;ll reply with questions, a suggested scope and
        next steps — no obligation.
      </PageHeader>

      <div className="container-page grid gap-12 py-section lg:grid-cols-[1fr_22rem]">
        <div>
          {service && (
            <p className="mb-6 rounded-lg border border-line-strong bg-raised px-4 py-3 text-sm text-fg-secondary">
              You&rsquo;re asking about: <strong className="text-fg">{service.title}</strong>
            </p>
          )}
          <ContactForm
            services={services}
            initialService={params.get("service") ?? undefined}
            fallbackEmail={profile.email_public}
          />

          <h2 className="mt-12 text-h3">What to include</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-fg-secondary marker:text-muted">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <aside aria-labelledby="direct-title" className="space-y-4">
          <h2 id="direct-title" className="label-mono text-muted">
            Prefer to reach out directly?
          </h2>
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="flex items-center gap-2 font-display font-medium">
              <Mail size={18} aria-hidden="true" className="text-primary-text" /> Email
            </p>
            <p className="mt-2 text-sm break-all">
              {profile.email_public ? (
                <a href={`mailto:${profile.email_public}`}>{profile.email_public}</a>
              ) : (
                <Fact value={null} missing="public email (CONTENT_CHECKLIST A)" />
              )}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="flex items-center gap-2 font-display font-medium">
              <MessageCircle size={18} aria-hidden="true" className="text-primary-text" /> WhatsApp
            </p>
            <p className="mt-2 text-sm">
              {profile.whatsapp_public ? (
                <a
                  href={`https://wa.me/${profile.whatsapp_public.replace(/\D/g, "")}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Message on WhatsApp
                </a>
              ) : (
                <Todo>confirm whether to publish a WhatsApp number (optional)</Todo>
              )}
            </p>
          </div>
          <p className="text-sm text-muted">
            Typical reply time: <Todo>reply time</Todo>
          </p>
        </aside>
      </div>
    </>
  );
}
