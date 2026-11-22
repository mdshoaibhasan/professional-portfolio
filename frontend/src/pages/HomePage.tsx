import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Seo } from "@/components/ui/Seo";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function HomePage() {
  const featured = projects.find((project) => project.is_featured);
  return (
    <>
      <Seo description="Python and Django developer building reliable web platforms and APIs." />
      <section className="relative isolate overflow-hidden py-section">
        <div aria-hidden="true" className="absolute inset-0 -z-10 hairline-grid" />
        <div className="container-page">
          <p className="label-mono text-accent-text">{site.role}</p>
          <h1 className="mt-5 max-w-4xl text-display">
            Python &amp; Django developer building{" "}
            <span className="text-primary-text">reliable</span> web platforms and APIs.
          </h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to="/projects">
              View my work <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to="/contact" variant="secondary">
              Start a project
            </ButtonLink>
          </div>
          {featured && (
            <p className="mt-8 text-sm text-muted">
              Featured: <Link to={`/projects/${featured.slug}`}>{featured.title} case study →</Link>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
