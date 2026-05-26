import { randomUUID } from 'node:crypto'

import type { UnicomActor, UnicomEvent, UnicomMessage } from '@the-abyss/unicom-core'

import { UnicomAgentClient } from './agent-client.js'
import type {
  AgentActionInput,
  AgentEvidenceInput,
  ApprovalRequestInput,
  CompletionClaimInput,
  CreateUnicomAgentOptions,
} from './types.js'

function buildActor(options: CreateUnicomAgentOptions): UnicomActor {
  return {
    type: 'agent',
    id: options.id,
    displayName: options.displayName ?? options.id,
    role: options.role,
    capabilities: options.capabilities,
  }
}

export function createUnicomAgent(options: CreateUnicomAgentOptions) {
  const actor = buildActor(options)
  const client = new UnicomAgentClient(options.transport)
  const createId = options.createId ?? randomUUID
  const now = options.now ?? (() => new Date().toISOString())
  let currentRoomId: string | undefined

  function requireRoomId(roomId?: string): string {
    const resolved = roomId ?? currentRoomId
    if (!resolved) {
      throw new Error('Room id is required before sending agent events.')
    }
    return resolved
  }

  async function publishEvent(
    type: UnicomEvent['type'],
    payload: unknown,
    roomId?: string,
    risk: UnicomEvent['risk'] = 'medium',
    evidenceIds: string[] = [],
    requiresApproval = false
  ): Promise<UnicomEvent> {
    const event: UnicomEvent = {
      id: createId(),
      roomId: requireRoomId(roomId),
      type,
      actor,
      payload,
      risk,
      requiresApproval,
      createdAt: now(),
      evidenceIds,
    }
    return client.publish(event)
  }

  return {
    actor,
    async register(): Promise<void> {
      await client.registerAgent({
        id: actor.id,
        displayName: actor.displayName,
        role: actor.role,
        capabilities: actor.capabilities ?? [],
      })
    },
    async joinRoom(roomId: string): Promise<UnicomEvent> {
      currentRoomId = roomId
      return publishEvent('participant.joined', { participant: actor }, roomId, 'low')
    },
    async sendNote(body: string, roomId?: string): Promise<UnicomEvent> {
      const resolvedRoomId = requireRoomId(roomId)
      const message: UnicomMessage = {
        id: createId(),
        roomId: resolvedRoomId,
        actorId: actor.id,
        actorName: actor.displayName,
        actorRole: actor.role,
        kind: 'note',
        body,
        createdAt: now(),
      }
      return publishEvent('message.sent', { message }, resolvedRoomId, 'low')
    },
    async askQuestion(body: string, roomId?: string): Promise<UnicomEvent> {
      return publishEvent('agent.question', { summary: body }, roomId, 'low')
    },
    async sendWarning(body: string, roomId?: string): Promise<UnicomEvent> {
      return publishEvent('agent.warning', { summary: body }, roomId, 'high', [], true)
    },
    async proposeAction(input: AgentActionInput): Promise<UnicomEvent> {
      return publishEvent(
        'agent.proposal',
        {
          summary: input.summary,
          targetPaths: input.targetPaths ?? [],
          actionType: input.actionType,
        },
        input.roomId,
        input.risk ?? 'medium',
        [],
        (input.risk ?? 'medium') !== 'low'
      )
    },
    async handoff(summary: string, nextAgentId: string, roomId?: string): Promise<UnicomEvent> {
      return publishEvent('agent.handoff', { summary, nextAgentId }, roomId, 'medium')
    },
    async emitEvidence(input: AgentEvidenceInput): Promise<UnicomEvent> {
      const evidenceId = createId()
      return publishEvent(
        'agent.evidence',
        {
          evidence: {
            id: evidenceId,
            roomId: requireRoomId(input.roomId),
            summary: input.summary,
            command: input.command,
            result: input.result,
            filesTouched: input.filesTouched ?? [],
            verificationCommands: input.verificationCommands ?? [],
            createdAt: now(),
          },
        },
        input.roomId,
        'medium',
        [evidenceId]
      )
    },
    async requestApproval(input: ApprovalRequestInput): Promise<UnicomEvent> {
      return publishEvent(
        'decision.proposed',
        {
          decision: {
            id: createId(),
            roomId: requireRoomId(input.roomId),
            title: input.title,
            summary: input.summary,
            status: 'proposed',
            targetEventId: input.targetEventId,
            createdAt: now(),
            updatedAt: now(),
            requiresApproval: true,
          },
        },
        input.roomId,
        'high',
        [],
        true
      )
    },
    async claimCompletion(input: CompletionClaimInput): Promise<UnicomEvent> {
      return publishEvent(
        'agent.completion_claim',
        {
          summary: input.summary,
          verificationSummary: input.verificationSummary,
          residualRisk: input.residualRisk,
          scopeSummary: input.scopeSummary,
        },
        input.roomId,
        'medium',
        input.evidenceIds
      )
    },
  }
}
