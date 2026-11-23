import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ConsentContext, type ConsentState } from "@/features/consent/context";
import { hasTrackers, trackerConfig } from "@/features/consent/config";
import { readConsent, saveConsent, type ConsentChoice } from "@/features/consent/storage";
import { applyConsent } from "@/features/consent/trackers";

export function ConsentProvider({ children }: { children: ReactNode }) {
  const config = useMemo(() => trackerConfig(), []);
  const enabled = hasTrackers(config);
  const [choice, setChoice] = useState<ConsentChoice | null>(() =>
    enabled ? readConsent() : null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (enabled && choice) applyConsent(choice, config);
  }, [enabled, choice, config]);

  const decide = useCallback(
    (next: ConsentChoice) => {
      saveConsent(next);
      setSettingsOpen(false);
      const { needsReload } = applyConsent(next, config);
      if (needsReload) window.location.reload();
      else setChoice(next);
    },
    [config],
  );

  const value = useMemo<ConsentState>(
    () => ({
      enabled,
      choice,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      decide,
    }),
    [enabled, choice, settingsOpen, decide],
  );
  return <ConsentContext value={value}>{children}</ConsentContext>;
}
