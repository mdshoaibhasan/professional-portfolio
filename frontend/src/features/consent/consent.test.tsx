import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsentBanner } from "@/features/consent/ConsentBanner";
import { ConsentProvider } from "@/features/consent/ConsentContext";
import type { TrackerConfig } from "@/features/consent/config";
import { readConsent, saveConsent } from "@/features/consent/storage";
import { applyConsent, resetTrackersForTests, trackLead } from "@/features/consent/trackers";

const NONE: TrackerConfig = { ga4Id: null, adsId: null, metaPixelId: null };
const ALL: TrackerConfig = { ga4Id: "G-TEST", adsId: "AW-TEST", metaPixelId: "123" };

function scriptSources(): string[] {
  return [...document.head.querySelectorAll("script")].map((script) => script.src);
}

/** gtag pushes Arguments objects; turn them into arrays for assertions. */
function dataLayerCalls(): unknown[][] {
  return (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
}

beforeEach(() => {
  localStorage.clear();
  resetTrackersForTests();
  document.head.querySelectorAll("script").forEach((script) => script.remove());
});

afterEach(() => vi.unstubAllEnvs());

describe("consent storage", () => {
  it("is empty until a choice is saved, then round-trips", () => {
    expect(readConsent()).toBeNull();
    saveConsent({ analytics: true, marketing: false });
    expect(readConsent()).toEqual({ analytics: true, marketing: false });
  });

  it("ignores corrupted or foreign values", () => {
    localStorage.setItem("consent.v1", "{not json");
    expect(readConsent()).toBeNull();
    localStorage.setItem("consent.v1", JSON.stringify({ analytics: "yes" }));
    expect(readConsent()).toBeNull();
  });
});

describe("tracker loading", () => {
  it("loads nothing when everything is refused", () => {
    applyConsent({ analytics: false, marketing: false }, ALL);
    expect(scriptSources()).toEqual([]);
    expect(window.gtag).toBeUndefined();
    expect(window.fbq).toBeUndefined();
  });

  it("analytics only: Google Analytics with ad signals denied, no Meta", () => {
    applyConsent({ analytics: true, marketing: false }, ALL);
    expect(scriptSources()).toEqual(["https://www.googletagmanager.com/gtag/js?id=G-TEST"]);
    const calls = dataLayerCalls();
    expect(calls[0]).toEqual([
      "consent",
      "default",
      {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      },
    ]);
    expect(calls[1]).toEqual([
      "consent",
      "update",
      {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "granted",
      },
    ]);
    expect(calls).toContainEqual(["config", "G-TEST"]);
    expect(calls).not.toContainEqual(["config", "AW-TEST"]);
    expect(window.fbq).toBeUndefined();
  });

  it("marketing loads Google Ads and the Meta Pixel", () => {
    applyConsent({ analytics: false, marketing: true }, ALL);
    expect(scriptSources()).toEqual([
      "https://www.googletagmanager.com/gtag/js?id=AW-TEST",
      "https://connect.facebook.net/en_US/fbevents.js",
    ]);
    expect(dataLayerCalls()).not.toContainEqual(["config", "G-TEST"]);
    expect(window.fbq?.queue).toContainEqual(["init", "123"]);
  });

  it("does nothing without configured IDs, whatever the choice", () => {
    applyConsent({ analytics: true, marketing: true }, NONE);
    expect(scriptSources()).toEqual([]);
  });

  it("withdrawing consent after loading asks for a reload", () => {
    applyConsent({ analytics: true, marketing: true }, ALL);
    expect(applyConsent({ analytics: true, marketing: false }, ALL).needsReload).toBe(true);
  });

  it("lead events carry no data and go only to consented platforms", () => {
    trackLead();
    expect(window.dataLayer).toBeUndefined();
    applyConsent({ analytics: true, marketing: false }, ALL);
    trackLead();
    expect(dataLayerCalls().at(-1)).toEqual(["event", "generate_lead"]);
  });
});

function renderBanner() {
  return render(
    <MemoryRouter>
      <ConsentProvider>
        <ConsentBanner />
      </ConsentProvider>
    </MemoryRouter>,
  );
}

describe("consent banner", () => {
  it("is not shown when no tracker is configured", () => {
    renderBanner();
    expect(screen.queryByRole("region", { name: "Cookie settings" })).not.toBeInTheDocument();
  });

  it("reject all: saves the choice, hides the banner, loads nothing", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "G-TEST");
    renderBanner();
    await userEvent.click(screen.getByRole("button", { name: "Reject all" }));
    expect(readConsent()).toEqual({ analytics: false, marketing: false });
    expect(screen.queryByRole("region", { name: "Cookie settings" })).not.toBeInTheDocument();
    expect(scriptSources()).toEqual([]);
  });

  it("accept all: grants only the categories that exist", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "G-TEST");
    renderBanner();
    await userEvent.click(screen.getByRole("button", { name: "Accept all" }));
    expect(readConsent()).toEqual({ analytics: true, marketing: false });
    expect(scriptSources()).toEqual(["https://www.googletagmanager.com/gtag/js?id=G-TEST"]);
  });

  it("choose: nothing is pre-ticked", async () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "G-TEST");
    vi.stubEnv("VITE_META_PIXEL_ID", "123");
    renderBanner();
    await userEvent.click(screen.getByRole("button", { name: "Choose" }));
    expect(screen.getByRole("checkbox", { name: /Analytics/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Marketing/ })).not.toBeChecked();
    await userEvent.click(screen.getByRole("checkbox", { name: /Marketing/ }));
    await userEvent.click(screen.getByRole("button", { name: "Save choices" }));
    expect(readConsent()).toEqual({ analytics: false, marketing: true });
  });

  it("stays hidden on later visits once a choice exists", () => {
    vi.stubEnv("VITE_GA4_MEASUREMENT_ID", "G-TEST");
    saveConsent({ analytics: false, marketing: false });
    renderBanner();
    expect(screen.queryByRole("region", { name: "Cookie settings" })).not.toBeInTheDocument();
  });
});
