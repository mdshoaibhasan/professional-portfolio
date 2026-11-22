import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { profile } from "@/content/profile";

export function ContactCta() {
  return (
    <section aria-labelledby="cta-title" className="border-t border-line py-section">
      <Reveal className="container-page">
        <div className="rounded-xl border border-line bg-surface px-6 py-12 sm:px-12">
          <h2 id="cta-title" className="max-w-2xl text-h2">
            Have a project in mind? Let&rsquo;s talk about it.
          </h2>
          <p className="mt-4 max-w-[60ch] text-body-lg text-fg-secondary">
            Tell me what you want to build. I&rsquo;ll reply with questions, a suggested scope, and
            next steps.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink to="/contact">
              Start a project <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
            {profile.email_public && (
              <a href={`mailto:${profile.email_public}`}>{profile.email_public}</a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
