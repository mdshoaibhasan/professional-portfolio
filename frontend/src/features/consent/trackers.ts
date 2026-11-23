/**
 * Loads third-party trackers only for consented categories (basic Google Consent Mode v2: every signal starts
 * "denied", and no Google or Meta script is requested before consent). No form data is ever sent: the only
 * conversion is a parameterless "lead" event.
 */
import type { TrackerConfig } from "@/features/consent/config";
import type { ConsentChoice } from "@/features/consent/storage";

type Command = (...args: unknown[]) => void;

/** Meta's fbq: a function that queues calls until fbevents.js arrives and sets callMethod. */
interface Fbq extends Command {
  queue: unknown[];
  callMethod?: Command;
  loaded: boolean;
  version: string;
  push: Command;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Command;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const loaded = { google: false, meta: false };
let granted: ConsentChoice = { analytics: false, marketing: false };

function addScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function loadGoogle(config: TrackerConfig, choice: ConsentChoice): void {
  const ga4 = choice.analytics ? config.ga4Id : null;
  const ads = choice.marketing ? config.adsId : null;
  if (loaded.google || (!ga4 && !ads)) return;
  loaded.google = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js only understands the Arguments object, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  const adsSignal = choice.marketing ? "granted" : "denied";
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("consent", "update", {
    ad_storage: adsSignal,
    ad_user_data: adsSignal,
    ad_personalization: adsSignal,
    analytics_storage: choice.analytics ? "granted" : "denied",
  });
  window.gtag("js", new Date());
  if (ga4) window.gtag("config", ga4);
  if (ads) window.gtag("config", ads);
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4 ?? ads ?? "")}`);
}

function loadMeta(pixelId: string): void {
  if (loaded.meta) return;
  loaded.meta = true;
  // Meta's standard queueing stub, so calls made before the script arrives are not lost.
  const call: Command = (...args) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  };
  const fbq: Fbq = Object.assign(call, { queue: [], loaded: true, version: "2.0", push: call });
  window.fbq = fbq;
  window._fbq = fbq;
  addScript("https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", pixelId);
  fbq("track", "PageView");
}

/** Start whatever the choice allows. Narrowing a choice after loading needs a reload (scripts can't unload). */
export function applyConsent(
  choice: ConsentChoice,
  config: TrackerConfig,
): { needsReload: boolean } {
  const narrowed =
    (granted.analytics && !choice.analytics) || (granted.marketing && !choice.marketing);
  granted = choice;
  loadGoogle(config, choice);
  if (choice.marketing && config.metaPixelId) loadMeta(config.metaPixelId);
  return { needsReload: narrowed && (loaded.google || loaded.meta) };
}

/** A successful inquiry. Sends no form data: just that a lead happened, to consented platforms only. */
export function trackLead(): void {
  if (granted.analytics && window.gtag) window.gtag("event", "generate_lead");
  if (granted.marketing && window.fbq) window.fbq("track", "Lead");
}

/** Test helper: forget loaded state. */
export function resetTrackersForTests(): void {
  loaded.google = false;
  loaded.meta = false;
  granted = { analytics: false, marketing: false };
  delete window.gtag;
  delete window.fbq;
  delete window.dataLayer;
}
