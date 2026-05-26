export function MetricTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-[var(--text)]">{value}</div>
      {hint ? <div className="mt-2 text-xs text-[var(--muted)]">{hint}</div> : null}
    </div>
  )
}
