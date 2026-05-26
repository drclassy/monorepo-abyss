import type { UnicomEvent } from '@the-abyss/unicom-core'
import { Send } from 'lucide-react'

import { formatEventLabel, humanTime } from '../lib/unicom'

export function RoomConsole({
  events,
  draft,
  onDraftChange,
  onSend,
}: {
  events: UnicomEvent[]
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => Promise<void>
}) {
  const visible = [...events]
    .filter((event) =>
      [
        'message.sent',
        'agent.proposal',
        'agent.warning',
        'agent.question',
        'agent.handoff',
        'decision.proposed',
        'policy.blocked',
      ].includes(event.type)
    )
    .slice(-16)

  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Room Console
        </div>
        <div className="mt-1 text-sm text-[var(--soft)]">
          Diskusi real-time antara agent dan Chief.
        </div>
      </header>

      <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
        {visible.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">Belum ada percakapan yang tampil.</div>
        ) : (
          visible.map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] p-3"
            >
              <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                <span>
                  {event.actor.displayName} · {formatEventLabel(event)}
                </span>
                <span>{humanTime(event.createdAt)}</span>
              </div>
              <div className="mt-2 text-sm leading-6 text-[var(--soft)]">
                {event.type === 'message.sent'
                  ? String((event.payload as { message?: { body?: string } }).message?.body ?? '')
                  : JSON.stringify(event.payload)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[var(--line)] px-4 py-4">
        <label className="block text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Chief message
        </label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            className="min-h-24 flex-1 rounded-md border border-[var(--line)] bg-[var(--panel-2)] px-3 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            placeholder="Tulis intervensi, arahan, atau klarifikasi untuk room ini."
          />
          <button
            type="button"
            onClick={() => void onSend()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--line-strong)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </section>
  )
}
