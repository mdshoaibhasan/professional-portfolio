import { data } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

/**
 * GET a JSON resource from the Django API. A 404 becomes a router 404 (rendered by the
 * route error boundary as the Not Found page); other failures surface as errors.
 */
export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) throw data(null, { status: 404 });
  if (!response.ok) throw new Error(`API request failed: ${response.status} ${path}`);
  return (await response.json()) as T;
}
