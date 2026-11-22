import type { ReactNode } from "react";

interface SectionLabelProps {
  index?: string;
  children: ReactNode;
}

/** Mono section label, e.g. "01 / Selected work". */
export function SectionLabel({ index, children }: SectionLabelProps) {
  return (
    <p className="label-mono text-accent-text">
      {index && <span className="text-muted">{index} / </span>}
      {children}
    </p>
  );
}
