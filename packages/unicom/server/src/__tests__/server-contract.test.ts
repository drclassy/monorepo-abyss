import type { Server as HttpServer } from 'node:http'

import { createFixtureActor } from '@the-abyss/unicom-testkit'
import { io as createSocket } from 'socket.io-client'
import { afterEach, describe, expect, it } from 'vitest'

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
})
