import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useSiteContent } from "@/app/site-content";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SpecList } from "@/components/ui/SpecList";
import { skillCategoryLabels, skillCategoryOrder } from "@/content/site";
import type { Skill } from "@/types/content";

function skillLabel(skill: Skill): string {
  return skill.level_label ? `${skill.name} (${skill.level_label.toLowerCase()})` : skill.name;
}

/**
 * Hero spec card (D-032): capability areas, each listing only skills used in real work.
 * Areas with no such skill are left out. Carries the page's single glow.
 */
export function CapabilitiesCard() {
  const { skills } = useSiteContent();
  const items = skillCategoryOrder
    .filter((category) => category !== "tool")
    .map((category) => ({
      label: skillCategoryLabels[category],
      value: skills
        .filter((skill) => skill.tier === "use" && skill.category === category)
        .map(skillLabel)
        .join(" · "),
    }))
    .filter((item) => item.value !== "");

  return (
    <article className="glow-behind">
      <div className="relative rounded-lg border border-line bg-surface p-6 sm:p-7">
        <SectionLabel index="Spec">Capabilities</SectionLabel>
        <h2 className="mt-4 text-h3">What I work with</h2>
        <div className="mt-5">
          <SpecList items={items} />
        </div>
        <Link
          to="/about#stack"
          className="mt-6 inline-flex min-h-11 items-center gap-2 font-display font-medium"
        >
          Full stack and skill levels <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
