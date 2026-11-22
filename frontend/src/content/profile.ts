import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  ProcessStep,
  Profile,
  Skill,
  SkillCategory,
} from "@/types/content";

/**
 * Owner profile. Source: docs/MASTER_PROMPT.md §3 (verified by the owner).
 * `null` = not supplied yet (see docs/CONTENT_CHECKLIST.md) and rendered as a visible placeholder.
 */
export const profile: Profile = {
  name: null, // CONTENT_CHECKLIST A
  headline: "Python & Django Developer",
  short_bio: null, // CONTENT_CHECKLIST A
  long_bio: null, // CONTENT_CHECKLIST A
  location_public: "Bangladesh",
  email_public: null, // CONTENT_CHECKLIST A
  whatsapp_public: null, // CONTENT_CHECKLIST A — optional, exposes the number publicly
  open_to_work: true,
  availability_note: "Available for freelance projects",
  strengths: [
    "Team operations",
    "Customer handling",
    "Workflow coordination",
    "Professional communication",
  ],
};

export const skills: Skill[] = [
  { name: "Python", category: "language", level_label: null },
  { name: "HTML", category: "language", level_label: null },
  { name: "Dart", category: "language", level_label: "Basic" },
  { name: "Django", category: "framework", level_label: null },
  { name: "Django REST Framework", category: "framework", level_label: null },
  { name: "REST API development", category: "framework", level_label: null },
  { name: "Bootstrap 5", category: "framework", level_label: null },
  { name: "Flutter", category: "framework", level_label: "Basic" },
  { name: "SQLite", category: "data", level_label: null },
  { name: "Git & GitHub", category: "tool", level_label: null },
  { name: "Postman", category: "tool", level_label: null },
  { name: "Linux", category: "tool", level_label: "Basic" },
];

export const skillCategoryLabels: Record<SkillCategory, string> = {
  language: "Languages",
  framework: "Frameworks & APIs",
  data: "Data",
  tool: "Tools",
};

// CONTENT_CHECKLIST D — role titles, organizations and dates still needed.
export const experience: ExperienceItem[] = [
  {
    title: null,
    organization: null,
    start_date: null,
    end_date: null,
    is_current: false,
    summary:
      "Operations role covering team operations, customer handling and workflow coordination.",
    highlights: [],
  },
];

// CONTENT_CHECKLIST B — institution, start year and current graduation status still needed.
export const education: EducationItem[] = [
  {
    institution: null,
    degree: "Computer Science and Engineering",
    start_year: null,
    status_label: null,
  },
];

// CONTENT_CHECKLIST C — exact title, issuer and date still needed.
export const certifications: CertificationItem[] = [
  {
    name: null,
    issuer: null,
    issue_date: null,
    credential_url: null,
    topic: "Python-based web application development",
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Discover",
    text: "We talk through your goals, users and constraints so the problem is clear before any code is written.",
  },
  {
    title: "Plan",
    text: "You get a written scope with milestones, timeline and cost, so there are no surprises later.",
  },
  {
    title: "Build",
    text: "I build in small, reviewable steps and share progress regularly so you can give feedback early.",
  },
  {
    title: "Launch & support",
    text: "I help deploy, hand over documentation, and fix issues that come up after launch.",
  },
];
