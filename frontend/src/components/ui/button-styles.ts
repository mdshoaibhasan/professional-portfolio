import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 py-2.5 font-display text-[0.95rem] font-medium no-underline transition-colors duration-150 ease-out-soft";

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-primary text-white hover:bg-primary-hover",
  secondary: "border-line-strong bg-transparent text-fg hover:border-muted hover:bg-surface",
  ghost: "border-transparent bg-transparent px-2 text-primary-text hover:underline",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return cn(base, variants[variant], className);
}
