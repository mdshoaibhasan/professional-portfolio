import { useSiteContent } from "@/app/site-content";
import { displayName } from "@/lib/display";

interface SeoProps {
  title?: string;
}

/**
 * Keeps the tab title current during in-app navigation (hoisted into <head> by React 19). Descriptions,
 * canonical, Open Graph and JSON-LD are rendered by Django for each URL (backend/apps/seo, D-038), which is
 * what crawlers read.
 */
export function Seo({ title }: SeoProps) {
  const { profile } = useSiteContent();
  const name = displayName(profile);
  const fullTitle = title ? `${title} — ${name}` : `${name} — ${profile.headline}`;
  return <title>{fullTitle}</title>;
}
