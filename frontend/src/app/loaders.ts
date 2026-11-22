import type { LoaderFunctionArgs } from "react-router";
import { apiGet } from "@/lib/api";
import type { ProjectDetail, ProjectListItem, ServiceDetail, SiteContent } from "@/types/content";

/** Route loaders. Each runs in parallel with its page's lazy code chunk. */

export const rootLoader = ({ request }: LoaderFunctionArgs) =>
  apiGet<SiteContent>("/site/", request.signal);

export async function homeLoader({ request }: LoaderFunctionArgs) {
  const [projects, services] = await Promise.all([
    apiGet<ProjectListItem[]>("/projects/", request.signal),
    apiGet<ServiceDetail[]>("/services/", request.signal),
  ]);
  return { projects, services };
}

export const projectsLoader = ({ request }: LoaderFunctionArgs) =>
  apiGet<ProjectListItem[]>("/projects/", request.signal);

export const projectLoader = ({ params, request }: LoaderFunctionArgs) =>
  apiGet<ProjectDetail>(`/projects/${encodeURIComponent(params.slug ?? "")}/`, request.signal);

export const servicesLoader = ({ request }: LoaderFunctionArgs) =>
  apiGet<ServiceDetail[]>("/services/", request.signal);

export async function serviceLoader({ params, request }: LoaderFunctionArgs) {
  const [service, services] = await Promise.all([
    apiGet<ServiceDetail>(`/services/${encodeURIComponent(params.slug ?? "")}/`, request.signal),
    apiGet<ServiceDetail[]>("/services/", request.signal),
  ]);
  return { service, others: services.filter((other) => other.slug !== service.slug) };
}
