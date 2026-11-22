import { ButtonLink } from "@/components/ui/ButtonLink";
import { Seo } from "@/components/ui/Seo";

export default function NotFoundPage() {
  return (
    <section className="container-page py-section">
      <Seo title="Page not found" description="The page you are looking for does not exist." />
      <meta name="robots" content="noindex" />
      <p className="label-mono text-accent-text">
        <span className="text-muted">404 / </span>Not found
      </p>
      <h1 className="mt-4 text-h1">This page doesn&rsquo;t exist.</h1>
      <p className="mt-4 max-w-[60ch] text-body-lg text-fg-secondary">
        The link may be broken, or the page may have moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/">Go to homepage</ButtonLink>
        <ButtonLink to="/projects" variant="secondary">
          View projects
        </ButtonLink>
      </div>
    </section>
  );
}
