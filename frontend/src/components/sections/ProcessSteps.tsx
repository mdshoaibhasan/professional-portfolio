import { processSteps } from "@/content/profile";

export function ProcessSteps() {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {processSteps.map((step, index) => (
        <li key={step.title} className="border-t border-line-strong pt-4">
          <p className="font-mono text-sm text-accent-text">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-2 text-h3">{step.title}</h3>
          <p className="mt-2 text-sm text-muted">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
