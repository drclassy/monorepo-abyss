import type { Server as HttpServer } from 'node:http'

import { createFixtureActor } from '@the-abyss/unicom-testkit'
import { io as createSocket } from 'socket.io-client'
import { afterEach, describe, expect, it } from 'vitest'

import type { AgentMonitorController } from '../runtime/monitor-controller.js'
import { createUnicomHttpServer } from '../server.js'

const servers: HttpServer[] = []

async function startServer(port = 0) {
  const server = createUnicomHttpServer({ port, seedDemo: false })
  servers.push(server)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Server address is unavailable.')
  }
  return { server, baseUrl: `http://127.0.0.1:${address.port}` }
}

async function startServerWithMonitors(monitorController: AgentMonitorController, port = 0) {
  const server = createUnicomHttpServer({
    port,
    seedDemo: false,
    monitorController,
  })
  servers.push(server)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Server address is unavailable.')
  }
  return { server, baseUrl: `http://127.0.0.1:${address.port}` }
}

class FakeMonitorController implements AgentMonitorController {
  private readonly states = new Map<
    string,
    {
      id: 'codex' | 'claude-code'
      label: string
      roomId: string
      status: 'running' | 'stopped' | 'error'
      aliases: string[]
    }
  >()

  listRoomMonitors(roomId: string) {
    return [
      this.snapshot(roomId, 'codex', 'Codex', ['@codex', 'codex']),
      this.snapshot(roomId, 'claude-code', 'Claude Code', ['@claude', '@claude-code']),
    ]
  }

  async startRoomMonitor(roomId: string, monitorId: 'codex' | 'claude-code') {
    const label = monitorId === 'codex' ? 'Codex' : 'Claude Code'
    const aliases = monitorId === 'codex' ? ['@codex', 'codex'] : ['@claude', '@claude-code']
    const state = {
      id: monitorId,
      label,
      roomId,
      status: 'running' as const,
      aliases,
    }
    this.states.set(`${roomId}:${monitorId}`, state)
    return state
  }

  async stopRoomMonitor(roomId: string, monitorId: 'codex' | 'claude-code') {
    const current = this.states.get(`${roomId}:${monitorId}`)
    if (current) {
      current.status = 'stopped'
      return current
    }
    return this.snapshot(
      roomId,
      monitorId,
      monitorId === 'codex' ? 'Codex' : 'Claude Code',
      monitorId === 'codex' ? ['@codex', 'codex'] : ['@claude', '@claude-code']
    )
  }

  buildWakeMessage(monitorId: 'codex' | 'claude-code', actorName: string) {
    return monitorId === 'codex'
      ? `${actorName}: @codex mohon monitor room ini.`
      : `${actorName}: @claude tolong monitor room ini.`
  }

  async dispose(): Promise<void> {}

  private snapshot(roomId: string, id: 'codex' | 'claude-code', label: string, aliases: string[]) {
    return (
      this.states.get(`${roomId}:${id}`) ?? {
        id,
        label,
        roomId,
        status: 'stopped' as const,
        aliases,
      }
    )
  }
}

afterEach(async () => {
  while (servers.length > 0) {
    const server = servers.pop()
    if (server) {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve(undefined)))
      )
    }
  }
})

describe('UNICOM server contract', () => {
  it('creates room, publishes events, pauses/resumes room, blocks forbidden paths, and streams state', async () => {
    const { baseUrl } = await startServer()
    const actor = createFixtureActor({
      type: 'human',
      id: 'chief',
      displayName: 'Chief',
      role: 'chief',
      capabilities: ['approve'],
    })

    const roomState = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'contract-room',
        title: 'Contract Room',
        actor,
        allowedPaths: ['packages/unicom/'],
        forbiddenPaths: ['packages/sentra/'],
      }),
    }).then((response) => response.json() as Promise<{ room: { id: string } }>)

    const roomId = roomState.room.id
    const socket = createSocket(baseUrl, { path: '/socket.io', transports: ['websocket'] })
    const states: Array<{ status: string }> = []
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => {
        socket.emit('room:join', roomId)
        resolve()
      })
      socket.on('connect_error', reject)
    })
    socket.on('room:state', (state) => {
      states.push(state as { status: string })
    })

    try {
      await fetch(`${baseUrl}/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor, body: 'Chief is watching this room.' }),
      })

      await fetch(`${baseUrl}/rooms/${roomId}/interventions/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor, note: 'Pause for review.' }),
      })

      await fetch(`${baseUrl}/rooms/${roomId}/interventions/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor, note: 'Resume after review.' }),
      })

      const blocked = await fetch(`${baseUrl}/rooms/${roomId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            id: 'event-1',
            roomId,
            type: 'agent.completion_claim',
            actor: createFixtureActor(),
            payload: { summary: 'Done without evidence.' },
            risk: 'medium',
            requiresApproval: false,
            createdAt: '2026-05-27T00:00:00.000Z',
            evidenceIds: [],
          },
        }),
      }).then(
        (response) => response.json() as Promise<{ accepted: boolean; event: { type: string } }>
      )

      const state = await fetch(`${baseUrl}/rooms/${roomId}`).then(
        (response) =>
          response.json() as Promise<{
            status: string
            messages: unknown[]
            blockedReasons: string[]
          }>
      )

      expect(blocked.accepted).toBe(false)
      expect(blocked.event.type).toBe('policy.blocked')
      expect(state.messages).toHaveLength(1)
      expect(state.blockedReasons).toHaveLength(1)

      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(states.some((entry) => entry.status === 'paused')).toBe(true)
      expect(states.at(-1)?.status).toBe('blocked')
    } finally {
      socket.close()
    }
  })

  it('approves a proposed decision without requiring the client to pass targetEventId', async () => {
    const { baseUrl } = await startServer()
    const chief = createFixtureActor({
      type: 'human',
      id: 'chief',
      displayName: 'Chief',
      role: 'chief',
      capabilities: ['approve'],
    })
    const orchestrator = createFixtureActor({
      type: 'agent',
      id: 'orchestrator-agent',
      displayName: 'Orchestrator Agent',
      role: 'orchestrator',
      capabilities: ['handoff'],
    })

    const roomState = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'approval-room',
        title: 'Approval Room',
        actor: chief,
        allowedPaths: ['packages/unicom/'],
        forbiddenPaths: ['packages/sentra/'],
      }),
    }).then((response) => response.json() as Promise<{ room: { id: string } }>)

    const roomId = roomState.room.id

    await fetch(`${baseUrl}/rooms/${roomId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: {
          id: 'decision-proposal-event',
          roomId,
          type: 'decision.proposed',
          actor: orchestrator,
          payload: {
            decision: {
              id: 'decision-1',
              roomId,
              title: 'Approve persistence scaffolding',
              summary: 'Need approval before persistence work continues.',
              status: 'proposed',
              createdAt: '2026-05-27T00:00:00.000Z',
              updatedAt: '2026-05-27T00:00:00.000Z',
              requiresApproval: true,
            },
          },
          risk: 'high',
          requiresApproval: true,
          createdAt: '2026-05-27T00:00:00.000Z',
          evidenceIds: [],
        },
      }),
    })

    const approval = await fetch(`${baseUrl}/rooms/${roomId}/decisions/decision-1/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor: chief,
        note: 'Approved by Chief.',
      }),
    }).then((response) => response.json() as Promise<{ accepted: boolean }>)

    const finalState = await fetch(`${baseUrl}/rooms/${roomId}`).then(
      (response) =>
        response.json() as Promise<{
          status: string
          pendingApprovalEventIds: string[]
          decisionsList: Array<{ id: string; status: string }>
        }>
    )

    expect(approval.accepted).toBe(true)
    expect(finalState.status).toBe('active')
    expect(finalState.pendingApprovalEventIds).toHaveLength(0)
    expect(finalState.decisionsList).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'decision-1', status: 'approved' })])
    )
  })

  it('stores agent.registered as append-only audit events', async () => {
    const { baseUrl } = await startServer()

    const response = await fetch(`${baseUrl}/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'quality-agent',
        displayName: 'Quality Agent',
        role: 'quality',
        capabilities: ['policy-review'],
      }),
    })

    expect(response.ok).toBe(true)

    const events = await fetch(`${baseUrl}/agents/events`).then(
      (result) =>
        result.json() as Promise<
          Array<{
            type: string
            roomId: string
            actor: { id: string; displayName: string }
            payload: { agent: { id: string } }
          }>
        >
    )

    expect(events).toEqual([
      expect.objectContaining({
        type: 'agent.registered',
        roomId: '__unicom-agent-registry__',
        actor: expect.objectContaining({
          id: 'quality-agent',
          displayName: 'Quality Agent',
        }),
        payload: {
          agent: expect.objectContaining({
            id: 'quality-agent',
          }),
        },
      }),
    ])
  })

  it('streams live rooms:list updates after approval changes room state', async () => {
    const { baseUrl } = await startServer()

    const chief = createFixtureActor({
      type: 'human',
      id: 'chief',
      displayName: 'Chief',
      role: 'chief',
      capabilities: ['approve'],
    })
    const orchestrator = createFixtureActor({
      type: 'agent',
      id: 'orchestrator-agent',
      displayName: 'Orchestrator Agent',
      role: 'orchestrator',
      capabilities: ['handoff'],
    })

    const socket = createSocket(baseUrl, { path: '/socket.io', transports: ['websocket'] })
    const roomLists: Array<Array<{ id: string; status: string; pendingApprovalCount: number }>> = []
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve())
      socket.on('connect_error', reject)
    })
    socket.on('rooms:list', (rooms) => {
      roomLists.push(rooms as Array<{ id: string; status: string; pendingApprovalCount: number }>)
    })

    try {
      const roomState = await fetch(`${baseUrl}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'live-room-list',
          title: 'Live Room List',
          actor: chief,
          allowedPaths: ['packages/unicom/'],
          forbiddenPaths: ['packages/sentra/'],
        }),
      }).then((response) => response.json() as Promise<{ room: { id: string } }>)

      const roomId = roomState.room.id

      await fetch(`${baseUrl}/rooms/${roomId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            id: 'decision-proposal-event-2',
            roomId,
            type: 'decision.proposed',
            actor: orchestrator,
            payload: {
              decision: {
                id: 'decision-live-1',
                roomId,
                title: 'Approve live sync',
                summary: 'Need approval before continuing.',
                status: 'proposed',
                createdAt: '2026-05-27T00:00:00.000Z',
                updatedAt: '2026-05-27T00:00:00.000Z',
                requiresApproval: true,
              },
            },
            risk: 'high',
            requiresApproval: true,
            createdAt: '2026-05-27T00:00:00.000Z',
            evidenceIds: [],
          },
        }),
      })

      await fetch(`${baseUrl}/rooms/${roomId}/decisions/decision-live-1/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: chief,
          note: 'Approved by Chief.',
        }),
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(
        roomLists.some((rooms) =>
          rooms.some(
            (room) =>
              room.id === roomId &&
              room.status === 'waiting-approval' &&
              room.pendingApprovalCount === 1
          )
        )
      ).toBe(true)
      expect(roomLists.at(-1)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: roomId,
            status: 'active',
            pendingApprovalCount: 0,
          }),
        ])
      )
    } finally {
      socket.close()
    }
  })

  it('lists, starts, wakes, and stops agent monitors through HTTP control endpoints', async () => {
    const { baseUrl } = await startServerWithMonitors(new FakeMonitorController())
    const chief = createFixtureActor({
      type: 'human',
      id: 'chief',
      displayName: 'Chief',
      role: 'chief',
      capabilities: ['approve', 'intervene'],
    })

    const roomState = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'monitor-room',
        title: 'Monitor Room',
        actor: chief,
        allowedPaths: ['packages/unicom/'],
        forbiddenPaths: ['packages/sentra/'],
      }),
    }).then((response) => response.json() as Promise<{ room: { id: string } }>)

    const roomId = roomState.room.id

    const initialMonitors = await fetch(`${baseUrl}/rooms/${roomId}/monitors`).then(
      (response) =>
        response.json() as Promise<Array<{ id: string; status: string; aliases: string[] }>>
    )
    const startedMonitor = await fetch(`${baseUrl}/rooms/${roomId}/monitors/codex/start`, {
      method: 'POST',
    }).then(
      (response) => response.json() as Promise<{ id: string; status: string; aliases: string[] }>
    )
    const wakeResult = await fetch(`${baseUrl}/rooms/${roomId}/monitors/codex/wake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: chief }),
    }).then(
      (response) =>
        response.json() as Promise<{
          accepted: boolean
          event: { type: string; payload: { message: { body: string } } }
        }>
    )
    const stoppedMonitor = await fetch(`${baseUrl}/rooms/${roomId}/monitors/codex/stop`, {
      method: 'POST',
    }).then(
      (response) => response.json() as Promise<{ id: string; status: string; aliases: string[] }>
    )

    expect(initialMonitors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'codex', status: 'stopped' }),
        expect.objectContaining({ id: 'claude-code', status: 'stopped' }),
      ])
    )
    expect(startedMonitor).toEqual(expect.objectContaining({ id: 'codex', status: 'running' }))
    expect(wakeResult.accepted).toBe(true)
    expect(wakeResult.event.type).toBe('message.sent')
    expect(wakeResult.event.payload.message.body).toContain('@codex')
    expect(stoppedMonitor).toEqual(expect.objectContaining({ id: 'codex', status: 'stopped' }))
  })

  it('archives and soft-deletes test rooms while keeping their direct state auditable', async () => {
    const { baseUrl } = await startServer()
    const chief = createFixtureActor({
      type: 'human',
      id: 'chief',
      displayName: 'Chief',
      role: 'chief',
      capabilities: ['approve', 'intervene'],
    })

    const archivedRoom = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'archive-me',
        title: 'Archive Me',
        actor: chief,
      }),
    }).then((response) => response.json() as Promise<{ room: { id: string } }>)

    const deletedRoom = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'delete-me',
        title: 'Delete Me',
        actor: chief,
      }),
    }).then((response) => response.json() as Promise<{ room: { id: string } }>)

    const archiveResult = await fetch(`${baseUrl}/rooms/${archivedRoom.room.id}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor: chief,
        note: 'Archive temporary room.',
      }),
    }).then(
      (response) => response.json() as Promise<{ accepted: boolean; state: { lifecycle: string } }>
    )

    const deleteResult = await fetch(`${baseUrl}/rooms/${deletedRoom.room.id}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor: chief,
        note: 'Delete temporary room from active dashboard.',
      }),
    }).then(
      (response) => response.json() as Promise<{ accepted: boolean; state: { lifecycle: string } }>
    )

    const activeRooms = await fetch(`${baseUrl}/rooms`).then(
      (response) => response.json() as Promise<Array<{ id: string }>>
    )
    const archivedState = await fetch(`${baseUrl}/rooms/${archivedRoom.room.id}`).then(
      (response) => response.json() as Promise<{ room: { lifecycle: string; archivedAt?: string } }>
    )
    const deletedState = await fetch(`${baseUrl}/rooms/${deletedRoom.room.id}`).then(
      (response) => response.json() as Promise<{ room: { lifecycle: string; deletedAt?: string } }>
    )

    expect(archiveResult.accepted).toBe(true)
    expect(deleteResult.accepted).toBe(true)
    expect(activeRooms).toHaveLength(0)
    expect(archivedState.room.lifecycle).toBe('archived')
    expect(archivedState.room.archivedAt).toBeTruthy()
    expect(deletedState.room.lifecycle).toBe('deleted')
    expect(deletedState.room.deletedAt).toBeTruthy()
  })
})
