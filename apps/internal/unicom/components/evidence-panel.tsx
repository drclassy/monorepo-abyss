import type { UnicomEvidence } from '@the-abyss/unicom-core'
import { FileTerminal } from 'lucide-react'

export function EvidencePanel({ evidence }: { evidence: UnicomEvidence[] }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Evidence Panel
        </div>
        <div className="mt-1 text-sm text-[var(--soft)]">
          Command, output summary, dan file yang disentuh.
        </div>
      </header>

      <div className="space-y-3 px-4 py-4">
        {evidence.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">Belum ada evidence terdaftar.</div>
        ) : (
          evidence.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-md border border-[var(--line)] p-2 text-[var(--soft)]">
                  <FileTerminal className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[var(--text)]">{item.summary}</div>
                  {item.command ? (
                    <div className="mt-2 overflow-x-auto rounded-md border border-[var(--line)] bg-[rgba(0,0,0,0.18)] px-3 py-2 font-mono text-xs text-[var(--soft)]">
                      {item.command}
                    </div>
                  ) : null}
                  {item.filesTouched.length > 0 ? (
                    <div className="mt-3 text-xs text-[var(--muted)]">
                      {item.filesTouched.join(', ')}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
