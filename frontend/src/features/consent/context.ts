import { createContext } from "react";
import type { ConsentChoice } from "@/features/consent/storage";

export interface ConsentState {
  /** False when no tracker is configured: then there is nothing to consent to and no banner. */
  enabled: boolean;
  choice: ConsentChoice | null;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  decide: (choice: ConsentChoice) => void;
}

export const ConsentContext = createContext<ConsentState | null>(null);
