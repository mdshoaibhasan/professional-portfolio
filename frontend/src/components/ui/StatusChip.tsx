interface StatusChipProps {
  available: boolean;
  label: string;
}

export function StatusChip({ available, label }: StatusChipProps) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-[0.8rem] font-medium text-fg-secondary">
      <span
        aria-hidden="true"
        className={
          available
            ? "size-2 animate-status-pulse rounded-full bg-success"
            : "size-2 rounded-full bg-muted"
        }
      />
      {label}
    </p>
  );
}
