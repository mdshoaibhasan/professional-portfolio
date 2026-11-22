import type { ReactNode } from "react";

interface TodoProps {
  /** What content is missing, e.g. "university name". */
  children: ReactNode;
}

/**
 * Visible placeholder for owner content that has not been supplied (docs/CONTENT_CHECKLIST.md).
 * Must not remain anywhere in the production launch build (checked in Milestone 9).
 */
export function Todo({ children }: TodoProps) {
  return (
    <span
      data-todo-content=""
      className="rounded-sm border border-dashed border-warning/60 px-1.5 py-0.5 font-mono text-[0.8em] text-warning"
    >
      TODO: {children}
    </span>
  );
}

interface FactProps {
  value: string | null | undefined;
  /** Description of the missing fact, shown when `value` is empty. */
  missing: string;
}

/** Renders a verified fact, or a <Todo> placeholder when the owner has not supplied it yet. */
export function Fact({ value, missing }: FactProps) {
  return value ? <>{value}</> : <Todo>{missing}</Todo>;
}
