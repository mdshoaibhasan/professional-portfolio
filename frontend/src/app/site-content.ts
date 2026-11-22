import { useRouteLoaderData } from "react-router";
import type { SiteContent } from "@/types/content";

export const ROOT_ROUTE_ID = "root";

/** Profile, skills, timeline and process steps loaded once by the root route. */
export function useSiteContent(): SiteContent {
  const content = useRouteLoaderData<SiteContent>(ROOT_ROUTE_ID);
  if (!content) throw new Error("Site content is not loaded");
  return content;
}
