import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/app/RootLayout";
import { RouteError } from "@/app/RouteError";
import NotFoundPage from "@/pages/NotFoundPage";

type PageModule = { default: ComponentType };

/** Route-level code splitting: each page is its own chunk. */
const page = (load: () => Promise<PageModule>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: RouteError,
    children: [
      { index: true, lazy: page(() => import("@/pages/HomePage")) },
      { path: "about", lazy: page(() => import("@/pages/AboutPage")) },
      { path: "projects", lazy: page(() => import("@/pages/ProjectsPage")) },
      { path: "projects/:slug", lazy: page(() => import("@/pages/ProjectDetailPage")) },
      { path: "services", lazy: page(() => import("@/pages/ServicesPage")) },
      { path: "services/:slug", lazy: page(() => import("@/pages/ServiceDetailPage")) },
      { path: "experience", lazy: page(() => import("@/pages/ExperiencePage")) },
      { path: "contact", lazy: page(() => import("@/pages/ContactPage")) },
      { path: "privacy", lazy: page(() => import("@/pages/PrivacyPage")) },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
