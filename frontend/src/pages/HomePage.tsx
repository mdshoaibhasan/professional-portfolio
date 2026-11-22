import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { BackgroundTimeline } from "@/components/sections/BackgroundTimeline";
import { ContactCta } from "@/components/sections/ContactCta";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FeaturedProjectCard, ProjectCard } from "@/components/sections/ProjectCards";
import { SecondaryServices, ServiceCard } from "@/components/sections/ServiceCards";
import { SkillGroups } from "@/components/sections/SkillGroups";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { Seo } from "@/components/ui/Seo";
import { StatusChip } from "@/components/ui/StatusChip";
import { Fact, Todo } from "@/components/ui/Todo";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { services } from "@/content/services";

export default function HomePage() {
  const featured = projects.find((project) => project.is_featured);
  const primaryServices = services.filter((service) => service.tier === "primary");
  const secondaryServices = services.filter((service) => service.tier === "secondary");

  return (
    <>
      <Seo description="Python and Django developer building reliable web platforms and REST APIs. Available for freelance website, web application and API projects." />

      {/* Hero: identity + strongest project in the first viewport (D-012) */}
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 hairline-grid" />
        <div className="container-page grid items-center gap-12 py-section lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <StatusChip available={profile.open_to_work} label={profile.availability_note} />
            <h1 id="hero-title" className="mt-6 text-display">
              Python &amp; Django developer building{" "}
              <span className="text-primary-text">reliable</span> web platforms and APIs.
            </h1>
            <p className="mt-6 max-w-[60ch] text-body-lg text-fg-secondary">
              I design and build backend-driven web applications — from data models and REST APIs to
              the interfaces people use. Based in {profile.location_public}, available for remote
              projects.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/projects">
                View my work <ArrowRight size={18} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/contact" variant="secondary">
                Start a project
              </ButtonLink>
            </div>
            {featured && (
              <p className="mt-8 text-sm text-muted lg:hidden">
                Featured:{" "}
                <Link to={`/projects/${featured.slug}`}>{featured.title} case study →</Link>
              </p>
            )}
          </div>
          {featured && (
            <div className="hidden lg:block">
              <FeaturedProjectCard project={featured} />
            </div>
          )}
        </div>
      </section>

      <Section
        id="work"
        index="01"
        label="Selected work"
        title="Projects with real engineering behind them"
      >
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
        {projects.length < 3 && (
          <p className="mt-5 text-sm">
            <Todo>add 2–3 more projects (CONTENT_CHECKLIST E)</Todo>
          </p>
        )}
      </Section>

      <Section
        id="services"
        index="02"
        label="Services"
        title="What I can build for you"
        intro="Development is the core of what I do. Every engagement starts with a clear, written scope."
      >
        <ul className="grid gap-5 md:grid-cols-3">
          {primaryServices.map((service) => (
            <li key={service.slug}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
        <SecondaryServices services={secondaryServices} />
      </Section>

      <Section id="about" index="03" label="About & stack" title="A developer who communicates">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-body-lg text-fg-secondary">
            <p>
              <Fact value={profile.short_bio} missing="short bio, 2–3 sentences" />
            </p>
            <p>
              My background is in Computer Science and Engineering, and I&rsquo;m based in{" "}
              {profile.location_public}. Alongside development, I bring hands-on experience in{" "}
              {profile.strengths.join(", ").toLowerCase()}.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 font-display text-base">
              More about me <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <SkillGroups />
        </div>
      </Section>

      <Section id="process" index="04" label="Process" title="How a project runs">
        <ProcessSteps />
      </Section>

      <Section id="background" index="05" label="Experience & education" title="Background">
        <BackgroundTimeline />
      </Section>

      <ContactCta />
    </>
  );
}
