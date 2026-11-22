import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import {
  homeLoader,
  projectLoader,
  projectsLoader,
  rootLoader,
  serviceLoader,
  servicesLoader,
} from "@/app/loaders";
import { RootLayout } from "@/app/RootLayout";
import { RouteError } from "@/app/RouteError";
import { ROOT_ROUTE_ID } from "@/app/site-content";
import NotFoundPage from "@/pages/NotFoundPage";

type PageModule = { default: ComponentType };

/** Route-level code splitting: each page is its own chunk. */
const page = (load: () => Promise<PageModule>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  {
    id: ROOT_ROUTE_ID,
    path: "/",
    loader: rootLoader,
    Component: RootLayout,
    // Only reached if the site content itself fails to load (renders without the layout).
    ErrorBoundary: RouteError,
    // Shown while the first data request and page chunk load.
    HydrateFallback: () => <div className="min-h-dvh bg-canvas" />,
    children: [
      {
        // Page errors (e.g. an unknown project slug) render inside the layout.
        ErrorBoundary: RouteError,
        children: [
          { index: true, loader: homeLoader, lazy: page(() => import("@/pages/HomePage")) },
          { path: "about", lazy: page(() => import("@/pages/AboutPage")) },
          {
            path: "projects",
            loader: projectsLoader,
            lazy: page(() => import("@/pages/ProjectsPage")),
          },
          {
            path: "projects/:slug",
            loader: projectLoader,
            lazy: page(() => import("@/pages/ProjectDetailPage")),
          },
          {
            path: "services",
            loader: servicesLoader,
            lazy: page(() => import("@/pages/ServicesPage")),
          },
          {
            path: "services/:slug",
            loader: serviceLoader,
            lazy: page(() => import("@/pages/ServiceDetailPage")),
          },
          { path: "experience", lazy: page(() => import("@/pages/ExperiencePage")) },
          {
            path: "contact",
            loader: servicesLoader,
            lazy: page(() => import("@/pages/ContactPage")),
          },
          { path: "privacy", lazy: page(() => import("@/pages/PrivacyPage")) },
          { path: "*", Component: NotFoundPage },
        ],
      },
    ],
  },
]);
