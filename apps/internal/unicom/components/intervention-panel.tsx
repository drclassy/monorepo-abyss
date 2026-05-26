import { Pause, Play, Snowflake } from 'lucide-react'

export function InterventionPanel({
  onPause,
  onResume,
  onFreeze,
}: {
  onPause: () => Promise<void>
  onResume: () => Promise<void>
  onFreeze: () => Promise<void>
}) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Intervention Panel
        </div>
        <div className="mt-1 text-sm text-[var(--soft)]">
          Chief controls untuk pause, resume, dan freeze room.
        </div>
      </header>

      <div className="grid gap-3 px-4 py-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => void onPause()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel-2)] px-3 text-sm text-[var(--text)] transition hover:border-[var(--warning)]"
        >
          <Pause className="h-4 w-4" />
          Pause
        </button>
        <button
          type="button"
          onClick={() => void onResume()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel-2)] px-3 text-sm text-[var(--text)] transition hover:border-[var(--accent)]"
        >
          <Play className="h-4 w-4" />
          Resume
        </button>
        <button
          type="button"
          onClick={() => void onFreeze()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[rgba(212,109,92,0.4)] bg-[var(--panel-2)] px-3 text-sm text-[var(--danger)] transition hover:bg-[rgba(212,109,92,0.08)]"
        >
          <Snowflake className="h-4 w-4" />
          Freeze
        </button>
      </div>
    </section>
  )
}
