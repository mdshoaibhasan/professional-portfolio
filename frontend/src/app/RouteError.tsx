import { isRouteErrorResponse, useRouteError, useRouteLoaderData } from "react-router";
import { ROOT_ROUTE_ID } from "@/app/site-content";
import { ButtonLink } from "@/components/ui/ButtonLink";
import NotFoundPage from "@/pages/NotFoundPage";

/**
 * Router error boundary. 404s show the Not Found page; anything else a safe fallback.
 * Inside the layout (site content loaded) it renders a section; at the root it owns <main>.
 */
export function RouteError() {
  const error = useRouteError();
  const insideLayout = Boolean(useRouteLoaderData(ROOT_ROUTE_ID));
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  const Wrapper = insideLayout ? "section" : "main";
  return (
    <Wrapper
      id={insideLayout ? undefined : "main"}
      className="container-page flex min-h-[60dvh] flex-col justify-center py-section"
    >
      <title>Something went wrong</title>
      <p className="label-mono text-error">Error</p>
      <h1 className="mt-4 text-h1">Something went wrong.</h1>
      <p className="mt-4 max-w-[60ch] text-body-lg text-fg-secondary">
        The page could not be loaded. Please refresh, or try again in a moment.
      </p>
      <div className="mt-8">
        <ButtonLink to="/" reloadDocument>
          Go to homepage
        </ButtonLink>
      </div>
    </Wrapper>
  );
}
