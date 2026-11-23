import { Tag } from "@/components/ui/Tag";
import { useSiteContent } from "@/app/site-content";
import { nonUseTierLabels, skillCategoryLabels, skillCategoryOrder } from "@/content/site";
import type { Skill } from "@/types/content";

/** Skill tag with an honest level label, e.g. "Flutter · basic". No percentages (DESIGN_SYSTEM §7). */
function SkillTag({ skill }: { skill: Skill }) {
  return (
    <Tag>
      {skill.name}
      {skill.level_label && (
        <span className="text-muted"> · {skill.level_label.toLowerCase()}</span>
      )}
    </Tag>
  );
}

function Group({ label, skills }: { label: string; skills: Skill[] }) {
  if (skills.length === 0) return null;
  return (
    <div>
      <dt className="label-mono text-muted">{label}</dt>
      <dd className="mt-3">
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill.name}>
              <SkillTag skill={skill} />
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

/**
 * Skills used in real work, grouped by capability area, followed by separate "Currently learning" and
 * "Interested in" groups so learning is never presented as expertise (D-031).
 */
export function SkillGroups() {
  const { skills } = useSiteContent();
  const inUse = skills.filter((skill) => skill.tier === "use");
  return (
    <dl className="grid gap-6 sm:grid-cols-2">
      {skillCategoryOrder.map((category) => (
        <Group
          key={category}
          label={skillCategoryLabels[category]}
          skills={inUse.filter((skill) => skill.category === category)}
        />
      ))}
      {(Object.keys(nonUseTierLabels) as (keyof typeof nonUseTierLabels)[]).map((tier) => (
        <Group
          key={tier}
          label={nonUseTierLabels[tier]}
          skills={skills.filter((skill) => skill.tier === tier)}
        />
      ))}
    </dl>
  );
}
