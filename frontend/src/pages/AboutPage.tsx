import { ContactCta } from "@/components/sections/ContactCta";
import { SkillGroups } from "@/components/sections/SkillGroups";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Seo } from "@/components/ui/Seo";
import { Todo } from "@/components/ui/Todo";
import { profile } from "@/content/profile";

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="Python and Django developer and Computer Science and Engineering student in Bangladesh — background, skills and approach."
      />
      <PageHeader label="About" title="About me">
        Software developer focused on Python, Django and REST APIs, with a background in team
        operations and customer-facing work.
      </PageHeader>

      <section aria-label="Biography" className="py-section">
        <div className="container-page max-w-3xl space-y-5 text-body-lg text-fg-secondary">
          {profile.long_bio ? (
            profile.long_bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ) : (
            <p>
              <Todo>
                longer About text, or bullet facts to turn into copy (CONTENT_CHECKLIST A)
              </Todo>
            </p>
          )}
          <p>
            My background is in Computer Science and Engineering, and I hold a certification in
            Python-based web application development.
          </p>
        </div>
      </section>

      <Section
        id="stack"
        label="Stack"
        title="What I work with"
        intro="Tools I use in real projects. Where my experience is still foundational, it says so."
      >
        <SkillGroups />
      </Section>

      <Section
        id="strengths"
        label="Beyond code"
        title="Working with people, not just tickets"
        intro="Before and alongside development, I've worked in operational roles where reliability and communication mattered every day."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {profile.strengths.map((strength) => (
            <li key={strength} className="rounded-lg border border-line bg-surface p-5">
              <p className="font-display font-medium text-fg">{strength}</p>
            </li>
          ))}
        </ul>
      </Section>

      <ContactCta />
    </>
  );
}
