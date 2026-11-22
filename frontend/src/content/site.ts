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
  language: "Languages",
  framework: "Frameworks & APIs",
  data: "Data",
  tool: "Tools",
} as const;
