import type { UnicomRoomState } from '@the-abyss/unicom-core'
import { Flag, ShieldAlert } from 'lucide-react'

import { StatusChip } from './status-chip'

export function TaskBoard({ state }: { state: UnicomRoomState }) {
  const tasks = Object.values(state.tasks)

  return (
    <section className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Task Board
        </div>
        <div className="mt-1 text-sm text-[var(--soft)]">
          Objective, scope, dan boundary yang mengikat room.
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        {state.room?.objective ? (
          <div className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              <Flag className="h-4 w-4" />
              Objective
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--soft)]">{state.room.objective}</p>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] p-4">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              Allowed Paths
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(state.room?.allowedPaths ?? []).map((path) => (
                <StatusChip key={path} label={path} tone="ok" />
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              <ShieldAlert className="h-4 w-4" />
              Forbidden Paths
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(state.room?.forbiddenPaths ?? []).map((path) => (
                <StatusChip key={path} label={path} tone="danger" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] p-4 text-sm text-[var(--muted)]">
              Belum ada task terstruktur di room ini.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-medium text-[var(--text)]">{task.objective}</div>
                  <StatusChip
                    label={task.status}
                    tone={
                      task.status === 'completed'
                        ? 'ok'
                        : task.status === 'blocked'
                          ? 'danger'
                          : 'warn'
                    }
                  />
                </div>
                <div className="mt-2 text-xs text-[var(--muted)]">Risk: {task.risk}</div>
                {task.assignedTo.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.assignedTo.map((assignee) => (
                      <StatusChip key={assignee} label={assignee} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
