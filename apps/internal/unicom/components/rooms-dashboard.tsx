'use client'

import { ArrowRight, Plus, Radar, ShieldCheck, SquareActivity } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { getUnicomClient, chiefActor } from '../lib/unicom'

import { MetricTile } from './metric-tile'
import { StatusChip } from './status-chip'

type RoomSummary = Awaited<ReturnType<ReturnType<typeof getUnicomClient>['rooms']['list']>>[number]

export function RoomsDashboard() {
  const client = useMemo(() => getUnicomClient(), [])
  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [health, setHealth] = useState<{ status: string; rooms: number; agents: number } | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    async function load() {
      try {
        const [roomList, healthInfo] = await Promise.all([client.rooms.list(), client.health.get()])
        if (!cancelled) {
          setRooms(roomList)
          setHealth(healthInfo)
          setError(null)
          unsubscribe = client.rooms.subscribeList((nextRooms) => {
            if (cancelled) {
              return
            }

            setRooms(nextRooms)
            setHealth((current) =>
              current
                ? {
                    ...current,
                    rooms: nextRooms.length,
                  }
                : current
            )
          })
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'UNICOM load failed')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
      unsubscribe?.()
      client.close()
    }
  }, [client])

  async function createRoom() {
    setLoading(true)
    try {
      await client.rooms.create({
        slug: `unicom-room-${Date.now()}`,
        title: 'Chief Review Room',
        objective: 'Coordinate a scoped engineering review inside UNICOM.',
        mode: 'approval-gated',
        allowedPaths: ['packages/unicom/', 'apps/internal/unicom/', 'docs/unicom/'],
        forbiddenPaths: ['packages/sentra/'],
        actor: chiefActor,
      })
      const updated = await client.rooms.list()
      setRooms(updated)
      setError(null)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const pendingApprovals = rooms.reduce((total, room) => total + room.pendingApprovalCount, 0)
  const blockedRooms = rooms.filter(
    (room) => room.status === 'blocked' || room.status === 'frozen'
  ).length

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Chief Cockpit
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text)] lg:text-4xl">
              Sentra UNICOM
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Real-time coordination fabric untuk agent, evidence, approval, dan audit di dalam
              ABYSS.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void createRoom()}
            className="inline-flex h-11 items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--panel)] px-4 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
          >
            <Plus className="h-4 w-4" />
            Create Room
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Hub Status"
            value={health?.status ?? '--'}
            hint="Server + transport health"
          />
          <MetricTile
            label="Rooms"
            value={health?.rooms ?? rooms.length}
            hint="Room aktif yang bisa diawasi Chief"
          />
          <MetricTile
            label="Agents"
            value={health?.agents ?? '--'}
            hint="Agent yang sudah register ke fabric"
          />
          <MetricTile
            label="Pending Approval"
            value={pendingApprovals}
            hint="Keputusan yang menunggu Chief"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr,0.8fr]">
          <div className="rounded-md border border-[var(--line)] bg-[var(--panel)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                  Rooms Dashboard
                </div>
                <div className="mt-1 text-sm text-[var(--soft)]">
                  Room aktif, risk status, dan approval backlog.
                </div>
              </div>
              <StatusChip
                label={blockedRooms > 0 ? `${blockedRooms} blocked` : 'stable'}
                tone={blockedRooms > 0 ? 'danger' : 'ok'}
              />
            </div>

            <div className="divide-y divide-[var(--line)]">
              {loading ? (
                <div className="px-4 py-6 text-sm text-[var(--muted)]">Loading rooms…</div>
              ) : rooms.length === 0 ? (
                <div className="px-4 py-6 text-sm text-[var(--muted)]">Belum ada room aktif.</div>
              ) : (
                rooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/rooms/${room.id}`}
                    className="grid gap-3 px-4 py-4 transition hover:bg-[var(--panel-2)] md:grid-cols-[1.4fr,0.8fr,0.5fr]"
                  >
                    <div className="min-w-0">
                      <div className="text-base font-medium text-[var(--text)]">{room.title}</div>
                      <div className="mt-1 truncate text-sm text-[var(--muted)]">{room.slug}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusChip
                        label={room.status}
                        tone={
                          room.status === 'active'
                            ? 'ok'
                            : room.status === 'blocked' ||
                                room.status === 'failed' ||
                                room.status === 'frozen'
                              ? 'danger'
                              : 'warn'
                        }
                      />
                      <StatusChip label={room.mode} />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
                      <span>{room.pendingApprovalCount} approval</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                <Radar className="h-4 w-4" />
                Operating Posture
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--soft)]">
                Default mode berjalan sebagai collaborative + approval-gated. Chief bisa membaca,
                ikut bicara, menghentikan, dan mengambil alih kapan saja.
              </p>
            </div>

            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                <ShieldCheck className="h-4 w-4" />
                Guardrail Snapshot
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--soft)]">
                <li>No crown-jewel modification without approval.</li>
                <li>No completion claim without linked evidence.</li>
                <li>No clinical final diagnosis from agents.</li>
              </ul>
            </div>

            <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                <SquareActivity className="h-4 w-4" />
                Connection
              </div>
              <div className="mt-3 text-sm leading-6 text-[var(--soft)]">
                Base URL:{' '}
                <span className="font-mono text-[var(--text)]">
                  {process.env.NEXT_PUBLIC_UNICOM_BASE_URL ?? 'http://127.0.0.1:4327'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-md border border-[rgba(212,109,92,0.32)] bg-[rgba(212,109,92,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}
      </div>
    </main>
  )
}
