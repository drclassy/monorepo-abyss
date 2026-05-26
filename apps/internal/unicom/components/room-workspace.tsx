'use client'

import type { UnicomDecision, UnicomEvent, UnicomRoomState } from '@the-abyss/unicom-core'
import { ArrowLeft, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import {
  chiefActor,
  decisionList,
  evidenceList,
  formatEventLabel,
  getUnicomClient,
  humanTime,
} from '../lib/unicom'

import { AgentRoster } from './agent-roster'
import { AuditTimeline } from './audit-timeline'
import { DecisionLog } from './decision-log'
import { EvidencePanel } from './evidence-panel'
import { InterventionPanel } from './intervention-panel'
import { RoomConsole } from './room-console'
import { StatusChip } from './status-chip'
import { TaskBoard } from './task-board'

type RoomResponse = UnicomRoomState & {
  decisionsList?: unknown[]
  evidenceList?: unknown[]
  interventionsList?: unknown[]
}

export function RoomWorkspace({ roomId }: { roomId: string }) {
  const client = useMemo(() => getUnicomClient(), [])
  const [state, setState] = useState<RoomResponse | null>(null)
  const [events, setEvents] = useState<UnicomEvent[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let active = true

    async function load() {
      try {
        const [roomState, roomEvents] = await Promise.all([
          client.rooms.get(roomId),
          client.rooms.events(roomId),
        ])
        if (!active) {
          return
        }
        setState(roomState)
        setEvents(roomEvents)
        setError(null)
        unsubscribe = client.rooms.subscribe(roomId, (update) => {
          if (update.state) {
            const nextState = update.state as RoomResponse
            setState((current): RoomResponse => {
              if (!current) {
                return nextState
              }

              return {
                ...current,
                ...nextState,
                room: nextState.room ?? current.room ?? null,
              }
            })
          }
          if (update.events) {
            setEvents((current) => {
              const map = new Map(current.map((event) => [event.id, event]))
              for (const event of update.events ?? []) {
                map.set(event.id, event)
              }
              return [...map.values()].sort((left, right) =>
                left.createdAt.localeCompare(right.createdAt)
              )
            })
          }
        })
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load room')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      active = false
      unsubscribe?.()
      client.close()
    }
  }, [client, roomId])

  async function refresh() {
    setLoading(true)
    try {
      const [roomState, roomEvents] = await Promise.all([
        client.rooms.get(roomId),
        client.rooms.events(roomId),
      ])
      setState(roomState)
      setEvents(roomEvents)
      setError(null)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Failed to refresh room')
    } finally {
      setLoading(false)
    }
  }

  async function sendChiefMessage() {
    if (!draft.trim()) {
      return
    }
    try {
      await client.messages.send(roomId, {
        actor: chiefActor,
        body: draft.trim(),
      })
      setDraft('')
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : 'Failed to send message')
    }
  }

  async function pauseRoom() {
    try {
      await client.interventions.pause(roomId, chiefActor, 'Chief paused the room for review.')
    } catch (pauseError) {
      setError(pauseError instanceof Error ? pauseError.message : 'Failed to pause room')
    }
  }

  async function resumeRoom() {
    try {
      await client.interventions.resume(roomId, chiefActor, 'Chief resumed the room.')
    } catch (resumeError) {
      setError(resumeError instanceof Error ? resumeError.message : 'Failed to resume room')
    }
  }

  async function freezeRoom() {
    try {
      await client.interventions.freeze(roomId, chiefActor, 'Chief froze the room.')
    } catch (freezeError) {
      setError(freezeError instanceof Error ? freezeError.message : 'Failed to freeze room')
    }
  }

  async function approveDecisionEntry(decision: UnicomDecision) {
    try {
      await client.decisions.approve(
        roomId,
        decision.id,
        chiefActor,
        decision.targetEventId,
        'Approved by Chief.'
      )
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Failed to approve decision')
    }
  }

  async function rejectDecisionEntry(decision: UnicomDecision) {
    try {
      await client.decisions.reject(
        roomId,
        decision.id,
        chiefActor,
        decision.targetEventId,
        'Rejected by Chief.'
      )
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : 'Failed to reject decision')
    }
  }

  if (loading && !state) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-6 py-8 text-sm text-[var(--muted)] lg:px-10">
        Loading room…
      </main>
    )
  }

  if (!state) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-6 py-8 lg:px-10">
        <Link href="/rooms" className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
          <ArrowLeft className="h-4 w-4" />
          Back to rooms
        </Link>
        <div className="mt-6 rounded-md border border-[rgba(212,109,92,0.32)] bg-[rgba(212,109,92,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {error ?? 'Room not found.'}
        </div>
      </main>
    )
  }

  const decisions = decisionList(state)
  const evidence = evidenceList(state)

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to rooms
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-[var(--text)]">
                {state.room?.title ?? 'UNICOM Room'}
              </h1>
              <StatusChip
                label={state.status}
                tone={
                  state.status === 'active'
                    ? 'ok'
                    : state.status === 'blocked' ||
                        state.status === 'failed' ||
                        state.status === 'frozen'
                      ? 'danger'
                      : 'warn'
                }
              />
              <StatusChip label={state.mode} />
            </div>
            <div className="mt-3 text-sm text-[var(--muted)]">
              {state.room?.slug} · last event {humanTime(state.lastEventAt)}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 text-sm text-[var(--text)] transition hover:border-[var(--accent)]"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <StatusChip label={`${events.length} events`} />
            <StatusChip
              label={`${state.pendingApprovalEventIds.length} pending`}
              tone={state.pendingApprovalEventIds.length > 0 ? 'warn' : 'ok'}
            />
          </div>
        </header>

        {error ? (
          <div className="rounded-md border border-[rgba(212,109,92,0.32)] bg-[rgba(212,109,92,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
          <RoomConsole
            events={events}
            draft={draft}
            onDraftChange={setDraft}
            onSend={sendChiefMessage}
          />
          <AgentRoster state={state} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
          <TaskBoard state={state} />
          <EvidencePanel evidence={evidence} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
          <DecisionLog
            decisions={decisions}
            actor={chiefActor}
            onApprove={approveDecisionEntry}
            onReject={rejectDecisionEntry}
          />
          <InterventionPanel onPause={pauseRoom} onResume={resumeRoom} onFreeze={freezeRoom} />
        </section>

        <AuditTimeline events={events} />

        <section className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-xs text-[var(--muted)]">
          Room state: {formatEventLabel(events.at(-1) ?? ({ type: 'message.sent' } as UnicomEvent))}
        </section>
      </div>
    </main>
  )
}
