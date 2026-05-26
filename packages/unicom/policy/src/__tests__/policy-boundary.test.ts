import type { UnicomEvent, UnicomTask } from '@the-abyss/unicom-core'
import { describe, expect, it } from 'vitest'

import { assertAllowedScope, evaluateUnicomPolicy, requiresHumanApproval } from '../index.js'

const actor = {
  type: 'agent' as const,
  id: 'quality-agent',
  displayName: 'Quality Agent',
  role: 'quality',
  capabilities: ['policy-review'],
}

function event(overrides: Partial<UnicomEvent>): UnicomEvent {
  return {
    id: 'event-1',
    roomId: 'room-1',
    type: 'agent.proposal',
    actor,
    payload: {},
    risk: 'medium',
    requiresApproval: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    evidenceIds: [],
    ...overrides,
  }
}

const task: UnicomTask = {
  id: 'task-1',
  objective: 'Implement UNICOM core.',
  scope: [],
  nonScope: [],
  allowedPaths: ['packages/unicom/'],
  forbiddenPaths: ['packages/sentra/'],
  verificationCommands: [],
  acceptanceCriteria: [],
  risk: 'medium',
  status: 'active',
  assignedTo: [],
}

describe('UNICOM policy boundary', () => {
  it('blocks completion claim without evidence', () => {
    const decision = evaluateUnicomPolicy({
      event: event({
        type: 'agent.completion_claim',
        payload: { summary: 'Done.' },
      }),
    })

    expect(decision.verdict).toBe('block')
    expect(decision.matchedRule).toBe('completion-evidence')
  })

  it('requires approval for crown-jewel paths', () => {
    const decision = evaluateUnicomPolicy({
      event: event({
        payload: { expectedFiles: ['packages/sentra/sentra-pustaka/src/index.ts'] },
      }),
    })

    expect(decision.verdict).toBe('require_approval')
    expect(decision.matchedRule).toBe('crown-jewel')
  })

  it('requires approval for destructive actions', () => {
    const target = event({
      payload: { actionType: 'delete', targetPaths: ['packages/unicom/core/src/index.ts'] },
      risk: 'high',
    })

    expect(requiresHumanApproval(target)).toBe(true)
  })

  it.each([
    'AGENTS.md',
    '.gitignore',
    'pnpm-workspace.yaml',
    'tsconfig.json',
    'turbo.json',
    'package.json',
  ])('requires approval for root governance/workspace file %s', (path) => {
    const decision = evaluateUnicomPolicy({
      event: event({
        payload: { targetPaths: [path] },
      }),
    })

    expect(decision.verdict).toBe('require_approval')
    expect(decision.matchedRule).toBe('governance-policy-change')
  })

  it.each([
    '.agent/HANDOFF.md',
    'apps/_governance/APP_BOUNDARY_PREFLIGHT.md',
    'packages/unicom/policy/src/evaluate-policy.ts',
  ])('requires approval for protected governance path %s', (path) => {
    const decision = evaluateUnicomPolicy({
      event: event({
        payload: { expectedFiles: [path] },
      }),
    })

    expect(decision.verdict).toBe('require_approval')
    expect(decision.matchedRule).toBe('governance-policy-change')
  })

  it('requires approval for clinical hints and blocks final diagnosis claims', () => {
    const approval = evaluateUnicomPolicy({
      event: event({
        payload: { summary: 'Clinical review requested.' },
      }),
    })
    const blocked = evaluateUnicomPolicy({
      event: event({
        payload: { summary: 'final diagnosis for patient' },
      }),
    })

    expect(approval.verdict).toBe('require_approval')
    expect(blocked.verdict).toBe('block')
  })

  it('blocks events outside task scope', () => {
    const decision = assertAllowedScope({
      task,
      event: event({
        payload: { expectedFiles: ['tooling/governance/agent/healthcheck.js'] },
      }),
    })

    expect(decision.verdict).toBe('block')
  })

  it('allows low-risk room note inside scope', () => {
    const decision = evaluateUnicomPolicy({
      task,
      event: event({
        type: 'message.sent',
        risk: 'low',
        payload: {
          message: {
            id: 'message-1',
            roomId: 'room-1',
            actorId: actor.id,
            actorName: actor.displayName,
            actorRole: actor.role,
            kind: 'note',
            body: 'Scope confirmed.',
            createdAt: '2026-05-27T00:00:00.000Z',
          },
          targetPaths: ['packages/unicom/core/src/index.ts'],
        },
      }),
    })

    expect(decision.verdict).toBe('allow')
  })
})
