import type { Profile } from "@/types/content";

/** Placeholder shown until the owner's name is set in the admin (CONTENT_CHECKLIST A). */
export const NAME_PLACEHOLDER = "[Your Name]";

export function displayName(profile: Profile): string {
  return profile.name ?? NAME_PLACEHOLDER;
}
