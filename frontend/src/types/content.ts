/**
 * Content types. Field names mirror the planned Django REST API (docs/ARCHITECTURE.md §3)
 * and are checked against it by the backend's round-trip tests (apps/profiles/tests.py).
 *
 * Convention: a fact the owner has not supplied yet is `null`, never invented.
 * The UI renders `null` facts with the <Todo> placeholder component.
 */

export type ServiceTier = "primary" | "secondary";

export interface ServiceSummary {
  slug: string;
  title: string;
  tier: ServiceTier;
  summary: string;
}

export interface ServiceDetail extends ServiceSummary {
  description: string;
  ideal_for: string;
  includes: string[];
  excludes: string[];
  benefits: string[];
  /** Optional honest note about scope or experience level. */
  scope_note: string | null;
}

export type ProjectStatus = "pre-launch" | "live" | "archived";

export interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  is_featured: boolean;
  technologies: string[];
}

export interface SpecItem {
  label: string;
  value: string | null;
}

export interface CaseStudyPoint {
  title: string;
  text: string;
}

export interface CaseStudySection {
  id: string;
  title: string;
  body: string[];
  points: CaseStudyPoint[];
}

export interface ProjectDetail extends ProjectSummary {
  role: string | null;
  cover_image: string | null;
  period: string | null;
  repo_url: string | null;
  live_url: string | null;
  specs: SpecItem[];
  highlights: string[];
  sections: CaseStudySection[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

/** Capability area (docs/POSITIONING.md §2–§3). */
export type SkillCategory = "backend" | "frontend" | "mobile" | "database" | "tool";

/** "learning" and "interested" are shown separately and never presented as expertise (D-031). */
export type SkillTier = "use" | "learning" | "interested";

export interface Skill {
  name: string;
  category: SkillCategory;
  tier: SkillTier;
  /** Only set when it is truthful and useful, e.g. "Basic". Never a percentage. */
  level_label: string | null;
}

export interface Profile {
  name: string | null;
  headline: string;
  short_bio: string | null;
  long_bio: string[] | null;
  location_public: string | null;
  email_public: string | null;
  whatsapp_public: string | null;
  photo: string | null;
  open_to_work: boolean;
  availability_note: string;
  strengths: string[];
}

export interface ExperienceItem {
  title: string | null;
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  summary: string;
  highlights: string[];
}

export interface EducationItem {
  institution: string | null;
  degree: string;
  start_year: string | null;
  /** Free text so the owner can state the real status, e.g. "Expected November 2026". */
  status_label: string | null;
}

export interface CertificationItem {
  name: string | null;
  issuer: string | null;
  issue_date: string | null;
  credential_url: string | null;
  topic: string;
}

export interface ProcessStep {
  title: string;
  text: string;
}

/** Project as returned by the list endpoint (no case-study sections). */
export type ProjectListItem = Omit<ProjectDetail, "sections">;

/** GET /api/v1/site/ — layout and homepage content in one request. */
export interface SiteContent {
  profile: Profile;
  social_links: SocialLink[];
  skills: Skill[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  process_steps: ProcessStep[];
}
