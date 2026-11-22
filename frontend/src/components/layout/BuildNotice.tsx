/** Development-only marker for pages whose content is built in Milestone 4. */
export function BuildNotice() {
  return (
    <div className="container-page py-section">
      <p className="rounded-lg border border-dashed border-line-strong p-6 text-sm text-muted">
        <span className="label-mono text-warning">Milestone 4</span>
        <span className="mt-2 block">Page content is built in Milestone 4.</span>
      </p>
    </div>
  );
}
