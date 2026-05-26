import type { UnicomRoomState } from '@the-abyss/unicom-core'
import { Bot, Shield, User } from 'lucide-react'

import { StatusChip } from './status-chip'

export function AgentRoster({ state }: { state: UnicomRoomState }) {
  const participants = Object.values(state.participants)

  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Agent Roster
        </div>
        <div className="mt-1 text-sm text-[var(--soft)]">
          Peserta room yang aktif di state saat ini.
        </div>
      </header>

      <div className="divide-y divide-[var(--line)]">
        {participants.length === 0 ? (
          <div className="px-4 py-5 text-sm text-[var(--muted)]">
            Belum ada participant yang join room.
          </div>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="flex items-start justify-between gap-3 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md border border-[var(--line)] p-2 text-[var(--soft)]">
                  {participant.type === 'human' ? (
                    <User className="h-4 w-4" />
                  ) : participant.role?.includes('quality') ||
                    participant.role?.includes('clinical') ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">
                    {participant.displayName}
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {participant.role ?? participant.type} · {participant.id}
                  </div>
                  {participant.capabilities.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {participant.capabilities.map((capability) => (
                        <StatusChip key={capability} label={capability} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <StatusChip
                label={participant.type}
                tone={participant.type === 'human' ? 'warn' : 'ok'}
              />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
