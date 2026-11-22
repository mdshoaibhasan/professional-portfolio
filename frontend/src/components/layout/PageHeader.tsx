import type { ReactNode } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface PageHeaderProps {
  label: string;
  title: string;
  children?: ReactNode;
}

export function PageHeader({ label, title, children }: PageHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-line py-section">
      <div aria-hidden="true" className="absolute inset-0 -z-10 hairline-grid" />
      <div className="container-page">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="mt-4 max-w-4xl text-h1">{title}</h1>
        {children && (
          <div className="mt-6 max-w-[60ch] text-body-lg text-fg-secondary">{children}</div>
        )}
      </div>
    </header>
  );
}
