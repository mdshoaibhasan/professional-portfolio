import { isRouteErrorResponse, useRouteError } from "react-router";
import { ButtonLink } from "@/components/ui/ButtonLink";
import NotFoundPage from "@/pages/NotFoundPage";

/** Router-level error boundary: 404s get the 404 page, everything else a safe fallback. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  return (
    <main id="main" className="container-page flex min-h-dvh flex-col justify-center py-section">
      <title>Something went wrong</title>
      <p className="label-mono text-error">Error</p>
      <h1 className="mt-4 text-h1">Something went wrong.</h1>
      <p className="mt-4 max-w-[60ch] text-body-lg text-fg-secondary">
        The page failed to load. Please refresh, or return to the homepage.
      </p>
      <div className="mt-8">
        <ButtonLink to="/" reloadDocument>
          Go to homepage
        </ButtonLink>
      </div>
    </main>
  );
}
