import { useId, useState } from "react";
import { Link } from "react-router";
import { buttonClasses } from "@/components/ui/button-styles";
import { availableCategories, trackerConfig } from "@/features/consent/config";
import { useConsent } from "@/features/consent/useConsent";

/**
 * Shown until the visitor chooses, and again from "Cookie settings". Accept and reject look the same, nothing is
 * pre-ticked, and the banner never blocks the page or traps focus (D-039).
 */
export function ConsentBanner() {
  const { enabled, choice, settingsOpen } = useConsent();
  if (!enabled || (choice && !settingsOpen)) return null;
  // Mounted fresh each time it appears, so the checkboxes start from the current choice.
  return <ConsentPanel />;
}

function ConsentPanel() {
  const { choice, settingsOpen, decide, closeSettings } = useConsent();
  const available = availableCategories(trackerConfig());
  const [choosing, setChoosing] = useState(false);
  const [analytics, setAnalytics] = useState(choice?.analytics ?? false);
  const [marketing, setMarketing] = useState(choice?.marketing ?? false);
  const headingId = useId();
  const detailed = choosing || settingsOpen;

  return (
    <section
      aria-labelledby={headingId}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line-strong bg-surface/95 py-5 shadow-lg backdrop-blur"
    >
      <div className="container-page grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-[70ch] text-sm text-fg-secondary">
          <h2 id={headingId} className="font-display text-base font-medium text-fg">
            Cookie settings
          </h2>
          <p className="mt-1">
            With your permission, this site uses
            {available.analytics && " analytics cookies to understand how it is used"}
            {available.analytics && available.marketing && " and"}
            {available.marketing && " marketing cookies to measure advertising"}. Nothing optional
            loads unless you agree, and the contents of your messages are never shared.{" "}
            <Link to="/privacy">Privacy policy</Link>
          </p>
          {detailed && (
            <fieldset className="mt-4 grid gap-2">
              <legend className="sr-only">Optional cookies</legend>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked disabled className="size-4" />
                Necessary: always on (no tracking)
              </label>
              {available.analytics && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={analytics}
                    onChange={(event) => setAnalytics(event.target.checked)}
                  />
                  Analytics: Google Analytics
                </label>
              )}
              {available.marketing && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={marketing}
                    onChange={(event) => setMarketing(event.target.checked)}
                  />
                  Marketing: advertising measurement
                </label>
              )}
            </fieldset>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {detailed ? (
            <>
              <button
                type="button"
                className={buttonClasses("secondary")}
                onClick={() => decide({ analytics, marketing })}
              >
                Save choices
              </button>
              {settingsOpen && (
                <button type="button" className={buttonClasses("ghost")} onClick={closeSettings}>
                  Cancel
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className={buttonClasses("ghost")}
              onClick={() => setChoosing(true)}
            >
              Choose
            </button>
          )}
          <button
            type="button"
            className={buttonClasses("secondary")}
            onClick={() => decide({ analytics: false, marketing: false })}
          >
            Reject all
          </button>
          <button
            type="button"
            className={buttonClasses("secondary")}
            onClick={() =>
              decide({ analytics: available.analytics, marketing: available.marketing })
            }
          >
            Accept all
          </button>
        </div>
      </div>
    </section>
  );
}
