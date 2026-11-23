import type { ReactNode } from "react";
import { Link } from "react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Seo } from "@/components/ui/Seo";
import { Fact, Todo } from "@/components/ui/Todo";
import { useSiteContent } from "@/app/site-content";

/**
 * DRAFT privacy policy describing the site as designed (docs/ARCHITECTURE.md §4, §7).
 * Must be reviewed by the owner — and updated if analytics/ads are enabled in Milestone 8 —
 * before launch. Not legal advice.
 */
function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="text-h3">{title}</h2>
      <div className="mt-3 space-y-3 text-fg-secondary">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const { profile } = useSiteContent();
  return (
    <>
      <Seo
        title="Privacy policy"
        description="How this website collects, uses and protects the information you send through it."
      />
      <PageHeader label="Legal" title="Privacy policy">
        <span className="text-sm">
          Last updated: <Todo>date of publication</Todo>
        </span>
      </PageHeader>

      <div className="container-page max-w-3xl py-section">
        <p className="mb-10 text-sm">
          <Todo>owner review of this draft before launch</Todo>
        </p>

        <Block title="Who is responsible">
          <p>
            This website is run by <Fact value={profile.name} missing="your name" />, a software
            developer based in <Fact value={profile.location_public} missing="location" />. For any
            privacy question, contact{" "}
            <Fact value={profile.email_public} missing="privacy contact email" />.
          </p>
        </Block>

        <Block title="What information is collected">
          <p>
            <strong className="text-fg">When you send an inquiry</strong>, the details you enter:
            your name, email address, and optionally your company, WhatsApp number, the service you
            are interested in, your project description, budget and timeline.
          </p>
          <p>
            <strong className="text-fg">Basic technical data</strong> needed to run and protect the
            site: request logs kept by the hosting provider, and your IP address. To stop repeated
            or automated submissions, the IP address is held temporarily (for up to one hour) to
            count recent messages. It is not stored with your inquiry — only a one-way hashed
            version is kept, so repeated abuse can be recognised without keeping the address itself.
          </p>
        </Block>

        <Block title="How it is used">
          <p>
            Inquiry details are used only to reply to you and discuss your project. You will not be
            added to a mailing list, and no promotional emails are sent.
          </p>
          <p>Your information is not sold, and it is never shared with advertising platforms.</p>
        </Block>

        <Block title="Cookies and analytics">
          <p>
            The site currently uses no analytics or advertising cookies. If analytics are added in
            future, they will only run after you give consent, and this policy will be updated
            first.
          </p>
        </Block>

        <Block title="How long it is kept">
          <p>
            Inquiries are kept for <Todo>retention period, e.g. 12 months</Todo> and then deleted,
            unless they lead to an ongoing project.
          </p>
        </Block>

        <Block title="How it is protected">
          <p>
            The site is served over HTTPS. Inquiry data is stored in a database that is not publicly
            accessible, and only the site owner can view it.
          </p>
        </Block>

        <Block title="Your choices">
          <p>
            You can ask to see, correct or delete the information you sent at any time by emailing{" "}
            <Fact value={profile.email_public} missing="privacy contact email" />.
          </p>
          <p>
            You can also reach out without the form — see the{" "}
            <Link to="/contact">contact page</Link>.
          </p>
        </Block>
      </div>
    </>
  );
}
