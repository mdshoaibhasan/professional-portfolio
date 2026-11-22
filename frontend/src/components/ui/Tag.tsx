import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TagProps {
  children: ReactNode;
  tone?: "neutral" | "warning";
}

export function Tag({ children, tone = "neutral" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm border px-2 py-0.5 font-mono text-xs whitespace-nowrap",
        tone === "warning"
          ? "border-warning/30 bg-warning/10 text-warning"
          : "border-line bg-raised text-fg-secondary",
      )}
    >
      {children}
    </span>
  );
}

export function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
