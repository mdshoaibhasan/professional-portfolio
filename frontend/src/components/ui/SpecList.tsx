import { Fact } from "@/components/ui/Todo";
import type { SpecItem } from "@/types/content";

/** Engineering spec sheet: mono keys, plain values (DESIGN_SYSTEM §1). */
export function SpecList({ items }: { items: SpecItem[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="pt-0.5 label-mono text-muted">{item.label}</dt>
          <dd className="text-fg-secondary">
            <Fact value={item.value} missing={item.label.toLowerCase()} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
