import type { SocialLink } from "@/types/content";

export interface NavItem {
  label: string;
  to: string;
}

export const site = {
  // TODO(content): public display name (CONTENT_CHECKLIST A)
  name: "[Your Name]",
  // TODO(content): confirm headline wording (CONTENT_CHECKLIST A)
  role: "Python & Django Developer",
  // TODO(content): public contact email (CONTENT_CHECKLIST A)
  email: null as string | null,
  // TODO(content): GitHub / LinkedIn URLs (CONTENT_CHECKLIST A)
  socials: [] as SocialLink[],
} as const;

export const primaryNav: NavItem[] = [
  { label: "Projects", to: "/projects" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Experience", to: "/experience" },
];

export const contactNavItem: NavItem = { label: "Start a project", to: "/contact" };
