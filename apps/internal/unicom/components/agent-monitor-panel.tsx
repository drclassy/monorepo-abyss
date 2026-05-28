'use client'

import type { AgentMonitorId, AgentMonitorState } from '@the-abyss/unicom-client'
import { BellRing, Bot, Play, Square } from 'lucide-react'

import { StatusChip } from './status-chip'

export function AgentMonitorPanel({
  monitors,
  onStart,
  onStop,
  onWake,
}: {
  monitors: AgentMonitorState[]
  onStart: (monitorId: AgentMonitorId) => Promise<void>
  onStop: (monitorId: AgentMonitorId) => Promise<void>
  onWake: (monitorId: AgentMonitorId) => Promise<void>
}) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Agent Monitors
        </div>
        <div className="mt-1 text-sm text-[var(--soft)]">
          Start, wake, dan stop launcher monitor untuk Codex dan Claude Code dari cockpit.
        </div>
      </header>

      <div className="divide-y divide-[var(--line)]">
        {monitors.map((monitor) => {
          const running = monitor.status === 'running'

          return (
            <div
              key={monitor.id}
              className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md border border-[var(--line)] p-2 text-[var(--soft)]">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium text-[var(--text)]">{monitor.label}</div>
                    <StatusChip
                      label={monitor.status}
                      tone={running ? 'ok' : monitor.status === 'error' ? 'danger' : 'warn'}
                    />
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {monitor.aliases.join(', ')}
                    {monitor.pid ? ` · pid ${monitor.pid}` : ''}
                  </div>
                  {monitor.lastError ? (
                    <div className="mt-2 text-xs text-[var(--danger)]">{monitor.lastError}</div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void onStart(monitor.id)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel-2)] px-3 text-sm text-[var(--text)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={running}
                >
                  <Play className="h-4 w-4" />
                  Start
                </button>
                <button
                  type="button"
                  onClick={() => void onWake(monitor.id)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel-2)] px-3 text-sm text-[var(--text)] transition hover:border-[var(--warning)] disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={!running}
                >
                  <BellRing className="h-4 w-4" />
                  Wake
                </button>
                <button
                  type="button"
                  onClick={() => void onStop(monitor.id)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[rgba(212,109,92,0.35)] bg-[var(--panel-2)] px-3 text-sm text-[var(--danger)] transition hover:bg-[rgba(212,109,92,0.08)] disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={!running}
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
