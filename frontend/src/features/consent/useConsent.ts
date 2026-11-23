import { useContext } from "react";
import { ConsentContext, type ConsentState } from "@/features/consent/context";

export function useConsent(): ConsentState {
  const state = useContext(ConsentContext);
  if (!state) throw new Error("useConsent must be used inside <ConsentProvider>");
  return state;
}
