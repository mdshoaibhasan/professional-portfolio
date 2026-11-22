import { site } from "@/content/site";

interface SeoProps {
  title?: string;
  description: string;
}

/**
 * Per-page title and description, hoisted into <head> by React 19.
 * Canonical/Open Graph/JSON-LD are injected server-side by Django in Milestone 8 (D-006).
 */
export function Seo({ title, description }: SeoProps) {
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
    </>
  );
}
