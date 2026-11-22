import { useSiteContent } from "@/app/site-content";
import { displayName } from "@/lib/display";

interface SeoProps {
  title?: string;
  description: string;
}

/**
 * Per-page title and description, hoisted into <head> by React 19.
 * Canonical/Open Graph/JSON-LD are injected server-side by Django in Milestone 8 (D-006).
 */
export function Seo({ title, description }: SeoProps) {
  const { profile } = useSiteContent();
  const name = displayName(profile);
  const fullTitle = title ? `${title} — ${name}` : `${name} — ${profile.headline}`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
    </>
  );
}
