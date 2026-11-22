import { Tag } from "@/components/ui/Tag";
import { useSiteContent } from "@/app/site-content";
import { skillCategoryLabels } from "@/content/site";
import type { SkillCategory } from "@/types/content";

const order: SkillCategory[] = ["language", "framework", "data", "tool"];

/** Skills grouped by category with honest level labels — no percentages (DESIGN_SYSTEM §7). */
export function SkillGroups() {
  const { skills } = useSiteContent();
  return (
    <dl className="grid gap-6 sm:grid-cols-2">
      {order.map((category) => (
        <div key={category}>
          <dt className="label-mono text-muted">{skillCategoryLabels[category]}</dt>
          <dd className="mt-3">
            <ul className="flex flex-wrap gap-1.5">
              {skills
                .filter((skill) => skill.category === category)
                .map((skill) => (
                  <li key={skill.name}>
                    <Tag>
                      {skill.name}
                      {skill.level_label && (
                        <span className="text-muted"> · {skill.level_label.toLowerCase()}</span>
                      )}
                    </Tag>
                  </li>
                ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
