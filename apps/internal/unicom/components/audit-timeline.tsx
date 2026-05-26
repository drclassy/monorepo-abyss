import type { UnicomEvent } from '@the-abyss/unicom-core'

import { formatEventLabel, humanTime } from '../lib/unicom'

import { StatusChip } from './status-chip'

export function AuditTimeline({ events }: { events: UnicomEvent[] }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Audit Timeline
        </div>
        <div className="mt-1 text-sm text-[var(--soft)]">
          Append-only event trail yang bisa direkonstruksi.
        </div>
      </header>

      <div className="divide-y divide-[var(--line)]">
        {events.length === 0 ? (
          <div className="px-4 py-5 text-sm text-[var(--muted)]">Belum ada event.</div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="grid gap-3 px-4 py-4 md:grid-cols-[0.9fr,1.4fr,0.6fr]">
              <div className="text-xs text-[var(--muted)]">{humanTime(event.createdAt)}</div>
              <div>
                <div className="text-sm font-medium text-[var(--text)]">
                  {formatEventLabel(event)}
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {event.actor.displayName} · {event.actor.role ?? event.actor.type}
                </div>
              </div>
              <div className="flex justify-start md:justify-end">
                <StatusChip
                  label={event.risk}
                  tone={
                    event.risk === 'critical'
                      ? 'danger'
                      : event.risk === 'high'
                        ? 'warn'
                        : event.risk === 'low'
                          ? 'ok'
                          : 'neutral'
                  }
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
