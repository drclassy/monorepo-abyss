export function StatusChip({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: 'neutral' | 'ok' | 'warn' | 'danger'
}) {
  const toneClass =
    tone === 'ok'
      ? 'border-[rgba(110,163,149,0.4)] text-[var(--accent)]'
      : tone === 'warn'
        ? 'border-[rgba(201,138,79,0.4)] text-[var(--warning)]'
        : tone === 'danger'
          ? 'border-[rgba(212,109,92,0.4)] text-[var(--danger)]'
          : 'border-[var(--line)] text-[var(--soft)]'

  return (
    <span
      className={`inline-flex h-7 items-center rounded-md border px-2.5 text-[11px] font-medium uppercase tracking-[0.08em] ${toneClass}`}
    >
      {label}
    </span>
  )
}
