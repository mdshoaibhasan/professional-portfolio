import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/cn";

interface SectionProps {
  id: string;
  index?: string;
  label: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Page section with numbered mono label, heading and optional intro. */
export function Section({ id, index, label, title, intro, children, className }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("border-t border-line py-section", className)}
    >
      <Reveal className="container-page">
        <div className="mb-10 grid max-w-3xl gap-3">
          <SectionLabel index={index}>{label}</SectionLabel>
          <h2 id={headingId} className="text-h2">
            {title}
          </h2>
          {intro && <div className="text-body-lg text-fg-secondary">{intro}</div>}
        </div>
        {children}
      </Reveal>
    </section>
  );
}
