/** Static navigation config. Site content (profile, projects, services) comes from the API. */

export interface NavItem {
  label: string;
  to: string;
}

export const primaryNav: NavItem[] = [
  { label: "Projects", to: "/projects" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Experience", to: "/experience" },
];

export const contactNavItem: NavItem = { label: "Start a project", to: "/contact" };

export const skillCategoryLabels = {
  backend: "Backend",
  frontend: "Frontend",
  mobile: "Mobile",
  database: "Database",
  tool: "Tools",
} as const;

/** Display order of skill groups; tools come last because they are not a capability area. */
export const skillCategoryOrder = ["backend", "frontend", "mobile", "database", "tool"] as const;

/** Skills the owner does not yet use in real work, each shown in its own clearly labelled group (D-031). */
export const nonUseTierLabels = {
  learning: "Currently learning",
  interested: "Interested in",
} as const;
