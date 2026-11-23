/** The visitor's consent choice, kept in localStorage (no cookie is set until something is accepted). */
export interface ConsentChoice {
  analytics: boolean;
  marketing: boolean;
}

const KEY = "consent.v1";

export function readConsent(): ConsentChoice | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "analytics" in parsed &&
      "marketing" in parsed &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean"
    ) {
      return { analytics: parsed.analytics, marketing: parsed.marketing };
    }
  } catch {
    // Unreadable or blocked storage: treat as "not chosen yet".
  }
  return null;
}

export function saveConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...choice, savedAt: new Date().toISOString() }));
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
}
