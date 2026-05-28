import type { UnicomEvent } from '@the-abyss/unicom-core'
import { FakeUnicomTransport } from '@the-abyss/unicom-testkit'
import { describe, expect, it, vi } from 'vitest'

import {
  buildWakeAcknowledgement,
  createHttpUnicomAgentTransport,
  createUnicomAgent,
  eventMentionsAliases,
  getMessageBody,
  launchClaudeCodeUnicomAdapter,
  launchCodexUnicomAdapter,
  watchRoomEvents,
} from '../index.js'

class ReadableFakeTransport extends FakeUnicomTransport {
  constructor(private readonly eventSnapshots: Array<Array<{ id: string; roomId: string }>>) {
    super()
  }

  private cursor = 0

  async listRoomEvents() {
    const snapshot =
      this.eventSnapshots[Math.min(this.cursor, this.eventSnapshots.length - 1)] ?? []
    this.cursor += 1
    return snapshot.map((event) => ({
      ...event,
      type: 'message.sent' as const,
      actor: {
        type: 'agent' as const,
        id: 'claude-code-agent',
        displayName: 'Claude Code',
        role: 'reviewer',
        capabilities: ['room-write'],
      },
      payload: {
        message: {
          id: event.id,
          roomId: event.roomId,
          actorId: 'claude-code-agent',
          actorName: 'Claude Code',
          actorRole: 'reviewer',
          kind: 'note' as const,
          body: `event ${event.id}`,
          createdAt: '2026-05-27T00:00:00.000Z',
        },
      },
      risk: 'low' as const,
      requiresApproval: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      evidenceIds: [],
    }))
  }
}

class ScriptedReadableTransport extends FakeUnicomTransport {
  constructor(private readonly eventSnapshots: UnicomEvent[][]) {
    super()
  }

  private cursor = 0

  async listRoomEvents() {
    const snapshot =
      this.eventSnapshots[Math.min(this.cursor, this.eventSnapshots.length - 1)] ?? []
    this.cursor += 1
    return snapshot
  }
}

describe('UNICOM agent SDK', () => {
  it('registers agent identity and joins room', async () => {
    const transport = new FakeUnicomTransport()
    const agent = createUnicomAgent({
      id: 'builder-agent',
      displayName: 'Builder Agent',
      role: 'builder',
      capabilities: ['code-edit'],
      transport,
      createId: () => 'fixed-id',
      now: () => '2026-05-27T00:00:00.000Z',
    })

    await agent.register()
    await agent.joinRoom('room-1')

    expect(transport.registeredAgents[0]?.id).toBe('builder-agent')
    expect(transport.events[0]?.type).toBe('participant.joined')
  })

  it('sends a typed note event', async () => {
    const transport = new FakeUnicomTransport()
    const agent = createUnicomAgent({
      id: 'tester-agent',
      role: 'tester',
      capabilities: ['verification-run'],
      transport,
      createId: () => 'message-id',
      now: () => '2026-05-27T00:00:00.000Z',
    })

    await agent.joinRoom('room-1')
    await agent.sendNote('Verification started.')

    expect(transport.events[1]?.type).toBe('message.sent')
    expect((transport.events[1]?.payload as { message: { body: string } }).message.body).toBe(
      'Verification started.'
    )
  })

  it('emits evidence with linked evidence ids', async () => {
    const transport = new FakeUnicomTransport()
    const agent = createUnicomAgent({
      id: 'tester-agent',
      role: 'tester',
      capabilities: ['verification-run'],
      transport,
      createId: () => 'evidence-id',
      now: () => '2026-05-27T00:00:00.000Z',
    })

    await agent.joinRoom('room-1')
    await agent.emitEvidence({
      summary: 'Targeted test passed.',
      command: 'pnpm --filter @the-abyss/unicom-core test',
    })

    expect(transport.events[1]?.type).toBe('agent.evidence')
    expect(transport.events[1]?.evidenceIds).toEqual(['evidence-id'])
  })

  it('requests approval for a proposal and claims completion', async () => {
    const transport = new FakeUnicomTransport()
    let counter = 0
    const agent = createUnicomAgent({
      id: 'quality-agent',
      role: 'quality',
      capabilities: ['policy-review'],
      transport,
      createId: () => `generated-${++counter}`,
      now: () => '2026-05-27T00:00:00.000Z',
    })

    await agent.joinRoom('room-1')
    await agent.requestApproval({
      title: 'Approve release note update',
      summary: 'Need approval before touching policy docs.',
    })
    await agent.claimCompletion({
      summary: 'Review complete.',
      evidenceIds: ['generated-3'],
    })

    expect(transport.events[1]?.type).toBe('decision.proposed')
    expect(transport.events[1]?.requiresApproval).toBe(true)
    expect(transport.events[2]?.type).toBe('agent.completion_claim')
    expect(transport.events[2]?.evidenceIds).toEqual(['generated-3'])
  })

  it('provides an official HTTP transport for external agent runtimes', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            event: {
              id: 'event-1',
              roomId: 'room-1',
              type: 'message.sent',
              actor: {
                type: 'agent',
                id: 'codex-agent',
                displayName: 'Codex',
                role: 'executor',
                capabilities: ['room-write'],
              },
              payload: {
                message: {
                  id: 'message-1',
                  roomId: 'room-1',
                  actorId: 'codex-agent',
                  actorName: 'Codex',
                  actorRole: 'executor',
                  kind: 'note',
                  body: 'hello claude',
                  createdAt: '2026-05-27T00:00:00.000Z',
                },
              },
              risk: 'low',
              requiresApproval: false,
              createdAt: '2026-05-27T00:00:00.000Z',
              evidenceIds: [],
            },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 'event-1',
              roomId: 'room-1',
              type: 'message.sent',
              actor: {
                type: 'agent',
                id: 'codex-agent',
                displayName: 'Codex',
                role: 'executor',
                capabilities: ['room-write'],
              },
              payload: {
                message: {
                  id: 'message-1',
                  roomId: 'room-1',
                  actorId: 'codex-agent',
                  actorName: 'Codex',
                  actorRole: 'executor',
                  kind: 'note',
                  body: 'hello claude',
                  createdAt: '2026-05-27T00:00:00.000Z',
                },
              },
              risk: 'low',
              requiresApproval: false,
              createdAt: '2026-05-27T00:00:00.000Z',
              evidenceIds: [],
            },
          ]),
          { status: 200 }
        )
      )

    const transport = createHttpUnicomAgentTransport({
      baseUrl: 'http://127.0.0.1:4318',
      fetchImpl,
    })

    await transport.registerAgent({
      id: 'codex-agent',
      displayName: 'Codex',
      role: 'executor',
      capabilities: ['room-write'],
    })
    const published = await transport.publish({
      id: 'event-1',
      roomId: 'room-1',
      type: 'message.sent',
      actor: {
        type: 'agent',
        id: 'codex-agent',
        displayName: 'Codex',
        role: 'executor',
        capabilities: ['room-write'],
      },
      payload: {
        message: {
          id: 'message-1',
          roomId: 'room-1',
          actorId: 'codex-agent',
          actorName: 'Codex',
          actorRole: 'executor',
          kind: 'note',
          body: 'hello claude',
          createdAt: '2026-05-27T00:00:00.000Z',
        },
      },
      risk: 'low',
      requiresApproval: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      evidenceIds: [],
    })
    const roomEvents = await transport.listRoomEvents('room-1')

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(published.actor.displayName).toBe('Codex')
    expect(roomEvents).toHaveLength(1)
    expect(roomEvents[0]?.actor.displayName).toBe('Codex')
  })

  it('watches a room and only emits fresh events after priming', async () => {
    vi.useFakeTimers()

    const transport = new ReadableFakeTransport([
      [{ id: 'seed-event', roomId: 'room-1' }],
      [
        { id: 'seed-event', roomId: 'room-1' },
        { id: 'fresh-event', roomId: 'room-1' },
      ],
    ])
    const received: string[] = []

    const stop = watchRoomEvents(
      transport,
      'room-1',
      (events) => {
        received.push(...events.map((event) => event.id))
      },
      {
        pollIntervalMs: 50,
      }
    )

    await vi.advanceTimersByTimeAsync(60)
    stop()

    expect(received).toEqual(['fresh-event'])
    vi.useRealTimers()
  })

  it('launches a Codex adapter with runtime defaults and introduction', async () => {
    const transport = new ScriptedReadableTransport([[]])

    const runtime = await launchCodexUnicomAdapter({
      roomId: 'room-1',
      introduction: 'Codex online and ready for scoped work.',
      transport,
      createId: () => 'codex-id',
      now: () => '2026-05-27T00:00:00.000Z',
    })

    runtime.stop()

    expect(transport.registeredAgents[0]).toMatchObject({
      id: 'codex-agent',
      displayName: 'Codex',
      role: 'builder',
      capabilities: expect.arrayContaining(['room-write', 'code-edit']),
    })
    expect(transport.events[0]?.type).toBe('participant.joined')
    expect(transport.events[1]?.type).toBe('message.sent')
    expect((transport.events[1]?.payload as { message: { body: string } }).message.body).toBe(
      'Codex online and ready for scoped work.'
    )
  })

  it('launches a Claude Code adapter and reacts to room events', async () => {
    vi.useFakeTimers()

    const codexEvent = {
      id: 'event-1',
      roomId: 'room-1',
      type: 'message.sent' as const,
      actor: {
        type: 'agent' as const,
        id: 'codex-agent',
        displayName: 'Codex',
        role: 'builder',
        capabilities: ['room-write'],
      },
      payload: {
        message: {
          id: 'message-1',
          roomId: 'room-1',
          actorId: 'codex-agent',
          actorName: 'Codex',
          actorRole: 'builder',
          kind: 'note' as const,
          body: 'Please confirm receipt.',
          createdAt: '2026-05-27T00:00:00.000Z',
        },
      },
      risk: 'low' as const,
      requiresApproval: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      evidenceIds: [],
    }

    const transport = new ScriptedReadableTransport([[], [codexEvent]])
    const receivedBodies: string[] = []

    const runtime = await launchClaudeCodeUnicomAdapter({
      roomId: 'room-1',
      transport,
      pollIntervalMs: 50,
      createId: () => 'claude-id',
      now: () => '2026-05-27T00:00:00.000Z',
      onEvents: async ({ agent }, events) => {
        const bodies = events.map(
          (event) => (event.payload as { message?: { body?: string } }).message?.body ?? ''
        )
        receivedBodies.push(...bodies)
        await agent.sendNote('Claude Code received the Codex message.', 'room-1')
      },
    })

    await vi.advanceTimersByTimeAsync(60)
    runtime.stop()

    expect(transport.registeredAgents[0]).toMatchObject({
      id: 'claude-code-agent',
      displayName: 'Claude Code',
      role: 'quality',
      capabilities: expect.arrayContaining(['room-write', 'policy-review']),
    })
    expect(receivedBodies).toEqual(['Please confirm receipt.'])
    expect(transport.events.some((event) => event.type === 'message.sent')).toBe(true)
    expect(
      transport.events.some(
        (event) =>
          event.type === 'message.sent' &&
          (event.payload as { message: { body: string } }).message.body ===
            'Claude Code received the Codex message.'
      )
    ).toBe(true)

    vi.useRealTimers()
  })

  it('detects wake mentions and builds a compact acknowledgement', () => {
    const wakeEvent: UnicomEvent = {
      id: 'wake-event',
      roomId: 'room-1',
      type: 'message.sent',
      actor: {
        type: 'human',
        id: 'chief',
        displayName: 'Chief',
        role: 'chief',
        capabilities: [],
      },
      payload: {
        message: {
          id: 'message-1',
          roomId: 'room-1',
          actorId: 'chief',
          actorName: 'Chief',
          actorRole: 'chief',
          kind: 'note',
          body: 'Chief: @codex tolong monitor UNICOM room ini sekarang.',
          createdAt: '2026-05-27T00:00:00.000Z',
        },
      },
      risk: 'low',
      requiresApproval: false,
      createdAt: '2026-05-27T00:00:00.000Z',
      evidenceIds: [],
    }

    expect(getMessageBody(wakeEvent)).toBe('Chief: @codex tolong monitor UNICOM room ini sekarang.')
    expect(eventMentionsAliases(wakeEvent, ['@codex', 'codex-agent'])).toBe(true)
    expect(buildWakeAcknowledgement('Codex', getMessageBody(wakeEvent) ?? '')).toContain(
      'Codex online di UNICOM.'
    )
  })
})
