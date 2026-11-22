import type { ReactNode } from "react";
import { Fact, Todo } from "@/components/ui/Todo";
import { useSiteContent } from "@/app/site-content";

interface ItemProps {
  headingLevel: 2 | 3;
  when: ReactNode;
  title: ReactNode;
  detail: ReactNode;
}

function Item({ headingLevel, when, title, detail }: ItemProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <li className="relative pb-8 pl-7 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute top-2 -left-[5px] size-[9px] rounded-full border-2 border-primary-text bg-canvas"
      />
      <p className="font-mono text-xs text-muted">{when}</p>
      <Heading className="mt-1 text-h3">{title}</Heading>
      <div className="mt-1 text-sm text-muted">{detail}</div>
    </li>
  );
}

/** Combined experience, education and certification timeline (DESIGN_SYSTEM §7). */
export function BackgroundTimeline({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const { experience, education, certifications } = useSiteContent();
  return (
    <ol className="border-l border-line-strong">
      {experience.map((item, index) => (
        <Item
          headingLevel={headingLevel}
          key={`exp-${index}`}
          when={
            item.start_date ? (
              `${item.start_date} — ${item.is_current ? "Present" : (item.end_date ?? "")}`
            ) : (
              <Todo>dates</Todo>
            )
          }
          title={<Fact value={item.title} missing="role title" />}
          detail={
            <>
              <Fact value={item.organization} missing="organization" />
              <span className="mt-1 block">{item.summary}</span>
            </>
          }
        />
      ))}
      {education.map((item, index) => (
        <Item
          headingLevel={headingLevel}
          key={`edu-${index}`}
          when={<Fact value={item.status_label} missing="graduation status" />}
          title={item.degree}
          detail={<Fact value={item.institution} missing="university" />}
        />
      ))}
      {certifications.map((item, index) => (
        <Item
          headingLevel={headingLevel}
          key={`cert-${index}`}
          when={<Fact value={item.issue_date} missing="date" />}
          title={<Fact value={item.name} missing="certificate title" />}
          detail={
            <>
              <Fact value={item.issuer} missing="issuer" /> · {item.topic}
            </>
          }
        />
      ))}
    </ol>
  );
}
