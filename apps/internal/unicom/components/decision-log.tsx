import type { UnicomActor, UnicomDecision } from '@the-abyss/unicom-core'
import { Check, ShieldQuestion, X } from 'lucide-react'

import { StatusChip } from './status-chip'

export function DecisionLog({
  decisions,
  actor,
  onApprove,
  onReject,
}: {
  decisions: UnicomDecision[]
  actor: UnicomActor
  onApprove: (decision: UnicomDecision) => Promise<void>
  onReject: (decision: UnicomDecision) => Promise<void>
}) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Decision Log
        </div>
        <div className="mt-1 text-sm text-[var(--soft)]">
          Proposal, approval, dan veto yang menunggu Chief.
        </div>
      </header>

      <div className="space-y-3 px-4 py-4">
        {decisions.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">Belum ada decision entry.</div>
        ) : (
          decisions.map((decision) => (
            <div
              key={decision.id}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldQuestion className="h-4 w-4 text-[var(--warning)]" />
                    <div className="text-sm font-medium text-[var(--text)]">{decision.title}</div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--soft)]">{decision.summary}</p>
                </div>
                <StatusChip
                  label={decision.status}
                  tone={
                    decision.status === 'approved'
                      ? 'ok'
                      : decision.status === 'rejected' || decision.status === 'blocked'
                        ? 'danger'
                        : 'warn'
                  }
                />
              </div>

              {decision.status === 'proposed' ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void onApprove(decision)}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-[rgba(110,163,149,0.4)] px-3 text-sm text-[var(--accent)] transition hover:bg-[rgba(110,163,149,0.08)]"
                  >
                    <Check className="h-4 w-4" />
                    Approve as {actor.displayName}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onReject(decision)}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-[rgba(212,109,92,0.4)] px-3 text-sm text-[var(--danger)] transition hover:bg-[rgba(212,109,92,0.08)]"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
