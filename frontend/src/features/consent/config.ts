/**
 * Third-party trackers, configured at build time (VITE_* variables are public). With none set, the site loads
 * no tracker and shows no consent banner (D-039).
 */
export interface TrackerConfig {
  ga4Id: string | null;
  adsId: string | null;
  metaPixelId: string | null;
}

function value(name: "VITE_GA4_MEASUREMENT_ID" | "VITE_GOOGLE_ADS_ID" | "VITE_META_PIXEL_ID") {
  const raw: unknown = import.meta.env[name];
  return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
}

/** Read at call time so tests can change the environment. */
export function trackerConfig(): TrackerConfig {
  return {
    ga4Id: value("VITE_GA4_MEASUREMENT_ID"),
    adsId: value("VITE_GOOGLE_ADS_ID"),
    metaPixelId: value("VITE_META_PIXEL_ID"),
  };
}

/** Which optional categories exist at all: analytics = Google Analytics; marketing = Google Ads, Meta Pixel. */
export function availableCategories(config: TrackerConfig) {
  return {
    analytics: config.ga4Id !== null,
    marketing: config.adsId !== null || config.metaPixelId !== null,
  };
}

export function hasTrackers(config: TrackerConfig): boolean {
  const { analytics, marketing } = availableCategories(config);
  return analytics || marketing;
}
