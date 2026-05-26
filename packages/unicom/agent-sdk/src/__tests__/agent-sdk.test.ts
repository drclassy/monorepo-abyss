import { FakeUnicomTransport } from '@the-abyss/unicom-testkit'
import { describe, expect, it } from 'vitest'

import { createUnicomAgent } from '../index.js'

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
})
