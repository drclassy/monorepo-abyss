import { randomUUID } from 'node:crypto'

import {
  AgentRegisteredPayloadSchema,
  DecisionPayloadSchema,
  EvidencePayloadSchema,
  InterventionPayloadSchema,
  RoomLifecyclePayloadSchema,
  UnicomEventSchema,
  type UnicomActor,
  type UnicomEvent,
  type UnicomInterventionType,
  type UnicomMessage,
  type UnicomRoom,
} from '@the-abyss/unicom-core'
import { evaluateUnicomPolicy } from '@the-abyss/unicom-policy'

import { createDemoActor } from '../demo/fixtures.js'
import type { UnicomEventStore } from '../persistence/event-store.js'
import { MemoryEventStore } from '../persistence/memory-event-store.js'
import type { UnicomTransportAdapter } from '../realtime/transport-adapter.js'
import type {
  CreateRoomInput,
  DecisionActionInput,
  InterventionCommandInput,
  MessageCommandInput,
  RegisterAgentInput,
  RoomSummary,
  UnicomPublishResult,
} from '../types.js'
import { toRoomSummary } from '../types.js'

const systemActor: UnicomActor = {
  type: 'system',
  id: 'unicom-system',
  displayName: 'UNICOM System',
  role: 'system',
  capabilities: ['policy', 'audit'],
}

const AGENT_REGISTRY_STREAM_ID = '__unicom-agent-registry__'

function now(): string {
  return new Date().toISOString()
}

function createMessage(input: MessageCommandInput): UnicomMessage {
  return {
    id: randomUUID(),
    roomId: input.roomId,
    actorId: input.actor.id,
    actorName: input.actor.displayName,
    actorRole: input.actor.role,
    kind: input.kind ?? 'note',
    body: input.body,
    createdAt: now(),
  }
}

export class UnicomService {
  private readonly store: UnicomEventStore
  private readonly transport: UnicomTransportAdapter
  private readonly registeredAgents = new Map<string, RegisterAgentInput>()

  constructor(options: {
    store?: UnicomEventStore
    transport: UnicomTransportAdapter
    seedDemo?: boolean
  }) {
    this.store = options.store ?? new MemoryEventStore()
    this.transport = options.transport
    if (options.seedDemo ?? true) {
      void this.seedDemoScenario()
    }
  }

  listRegisteredAgents(): RegisterAgentInput[] {
    return [...this.registeredAgents.values()]
  }

  async registerAgent(input: RegisterAgentInput): Promise<RegisterAgentInput> {
    const actor: UnicomActor = {
      type: 'agent',
      id: input.id,
      displayName: input.displayName,
      role: input.role,
      capabilities: input.capabilities,
    }
    const event = UnicomEventSchema.parse({
      id: randomUUID(),
      roomId: AGENT_REGISTRY_STREAM_ID,
      type: 'agent.registered',
      actor,
      payload: AgentRegisteredPayloadSchema.parse({
        agent: actor,
      }),
      risk: 'low',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })

    this.registeredAgents.set(input.id, input)
    await this.store.appendAgentRegistration(event)
    return input
  }

  async listAgentRegistrationEvents(): Promise<UnicomEvent[]> {
    return this.store.listAgentRegistrationEvents()
  }

  async listRooms(): Promise<RoomSummary[]> {
    const states = await this.store.listRoomStates()
    return states.filter((state) => state.lifecycle === 'active').map(toRoomSummary)
  }

  async getRoomState(roomId: string) {
    return this.store.getRoomState(roomId)
  }

  async getRoomEvents(roomId: string) {
    return this.store.listRoomEvents(roomId)
  }

  async createRoom(input: CreateRoomInput) {
    const roomId = randomUUID()
    const createdAt = now()
    const room: UnicomRoom = {
      id: roomId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      objective: input.objective,
      mode: input.mode ?? 'approval-gated',
      status: 'active',
      lifecycle: 'active',
      createdAt,
      updatedAt: createdAt,
      risk: input.risk ?? 'medium',
      allowedPaths: input.allowedPaths ?? [],
      forbiddenPaths: input.forbiddenPaths ?? [],
    }

    const event = UnicomEventSchema.parse({
      id: randomUUID(),
      roomId,
      type: 'room.created',
      actor: input.actor,
      payload: room,
      risk: room.risk,
      requiresApproval: false,
      createdAt,
      evidenceIds: [],
    })

    await this.store.append(event)
    const state = await this.store.getRoomState(roomId)
    if (state) {
      this.transport.publishRoomUpdate(roomId, [event], state)
      this.transport.publishRoomList(await this.listRooms())
    }
    return state
  }

  async publishEvent(event: UnicomEvent): Promise<UnicomPublishResult> {
    const parsed = UnicomEventSchema.parse(event)
    const roomState = await this.store.getRoomState(parsed.roomId)
    const task = parsed.taskId ? roomState?.tasks[parsed.taskId] : undefined
    const decision = evaluateUnicomPolicy({ event: parsed, task })

    if (decision.verdict === 'block') {
      const blockedEvent = UnicomEventSchema.parse({
        id: randomUUID(),
        roomId: parsed.roomId,
        taskId: parsed.taskId,
        type: 'policy.blocked',
        actor: systemActor,
        payload: {
          matchedRule: decision.matchedRule,
          reason: decision.reason,
        },
        risk: decision.risk,
        requiresApproval: false,
        createdAt: now(),
        correlationId: parsed.id,
        evidenceIds: [],
      })
      await this.store.append(blockedEvent)
      const state = await this.store.getRoomState(parsed.roomId)
      if (!state) {
        throw new Error(`Room ${parsed.roomId} not found after policy block.`)
      }
      this.transport.publishRoomUpdate(parsed.roomId, [blockedEvent], state)
      this.transport.publishRoomList(await this.listRooms())
      return { accepted: false, event: blockedEvent, state }
    }

    const toStore =
      decision.verdict === 'require_approval'
        ? {
            ...parsed,
            requiresApproval: true,
            risk: decision.risk,
          }
        : parsed

    await this.store.append(toStore)
    const state = await this.store.getRoomState(parsed.roomId)
    if (!state) {
      throw new Error(`Room ${parsed.roomId} not found after append.`)
    }
    this.transport.publishRoomUpdate(parsed.roomId, [toStore], state)
    this.transport.publishRoomList(await this.listRooms())
    return { accepted: true, event: toStore, state }
  }

  async sendMessage(input: MessageCommandInput): Promise<UnicomPublishResult> {
    return this.publishEvent({
      id: randomUUID(),
      roomId: input.roomId,
      type: 'message.sent',
      actor: input.actor,
      payload: {
        message: createMessage(input),
      },
      risk: input.kind === 'warning' ? 'high' : 'low',
      requiresApproval: input.kind === 'warning',
      createdAt: now(),
      evidenceIds: [],
    })
  }

  async publishEvidence(event: UnicomEvent): Promise<UnicomPublishResult> {
    EvidencePayloadSchema.parse(event.payload)
    return this.publishEvent(event)
  }

  async publishDecision(event: UnicomEvent): Promise<UnicomPublishResult> {
    DecisionPayloadSchema.parse(event.payload)
    return this.publishEvent(event)
  }

  async publishInterventionEvent(event: UnicomEvent): Promise<UnicomPublishResult> {
    InterventionPayloadSchema.parse(event.payload)
    return this.publishEvent(event)
  }

  async issueIntervention(type: UnicomInterventionType, input: InterventionCommandInput) {
    const timestamp = now()
    const interventionId = randomUUID()
    const first = UnicomEventSchema.parse({
      id: randomUUID(),
      roomId: input.roomId,
      type: 'human.intervention',
      actor: input.actor,
      payload: {
        intervention: {
          id: interventionId,
          roomId: input.roomId,
          type,
          note: input.note,
          createdAt: timestamp,
        },
      },
      risk: type === 'freeze-room' ? 'critical' : 'high',
      requiresApproval: false,
      createdAt: timestamp,
      evidenceIds: [],
    })

    const followUpType =
      type === 'pause-room'
        ? 'room.paused'
        : type === 'resume-room'
          ? 'room.resumed'
          : 'room.frozen'
    const second = UnicomEventSchema.parse({
      id: randomUUID(),
      roomId: input.roomId,
      type: followUpType,
      actor: input.actor,
      payload: {
        interventionId,
        note: input.note,
      },
      risk: type === 'freeze-room' ? 'critical' : 'high',
      requiresApproval: false,
      createdAt: timestamp,
      correlationId: first.id,
      evidenceIds: [],
    })

    await this.store.appendMany([first, second])
    const state = await this.store.getRoomState(input.roomId)
    if (!state) {
      throw new Error(`Room ${input.roomId} not found after intervention.`)
    }
    this.transport.publishRoomUpdate(input.roomId, [first, second], state)
    this.transport.publishRoomList(await this.listRooms())
    return { accepted: true, event: second, state }
  }

  async archiveRoom(input: InterventionCommandInput): Promise<UnicomPublishResult> {
    return this.publishEvent({
      id: randomUUID(),
      roomId: input.roomId,
      type: 'room.archived',
      actor: input.actor,
      payload: RoomLifecyclePayloadSchema.parse({
        note: input.note,
      }),
      risk: 'medium',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
  }

  async deleteRoom(input: InterventionCommandInput): Promise<UnicomPublishResult> {
    return this.publishEvent({
      id: randomUUID(),
      roomId: input.roomId,
      type: 'room.deleted',
      actor: input.actor,
      payload: RoomLifecyclePayloadSchema.parse({
        note: input.note,
      }),
      risk: 'high',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
  }

  async approveDecision(input: DecisionActionInput): Promise<UnicomPublishResult> {
    const targetEventId = await this.resolveDecisionTargetEventId(
      input.roomId,
      input.decisionId,
      input.targetEventId
    )
    return this.publishEvent({
      id: randomUUID(),
      roomId: input.roomId,
      type: 'decision.approved',
      actor: input.actor,
      payload: {
        decisionId: input.decisionId,
        targetEventId,
        note: input.note,
      },
      risk: 'medium',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
  }

  async rejectDecision(input: DecisionActionInput): Promise<UnicomPublishResult> {
    const targetEventId = await this.resolveDecisionTargetEventId(
      input.roomId,
      input.decisionId,
      input.targetEventId
    )
    return this.publishEvent({
      id: randomUUID(),
      roomId: input.roomId,
      type: 'decision.rejected',
      actor: input.actor,
      payload: {
        decisionId: input.decisionId,
        targetEventId,
        note: input.note,
      },
      risk: 'high',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
  }

  private async resolveDecisionTargetEventId(
    roomId: string,
    decisionId: string,
    providedTargetEventId?: string
  ): Promise<string | undefined> {
    if (providedTargetEventId) {
      return providedTargetEventId
    }

    const roomEvents = await this.store.listRoomEvents(roomId)
    for (const event of [...roomEvents].reverse()) {
      if (event.type !== 'decision.proposed') {
        continue
      }

      const payload = DecisionPayloadSchema.safeParse(event.payload)
      if (payload.success && payload.data.decision.id === decisionId) {
        return event.id
      }
    }

    return undefined
  }

  private async seedDemoScenario(): Promise<void> {
    if ((await this.listRooms()).length > 0) {
      return
    }

    const chief = createDemoActor({
      type: 'human',
      id: 'chief',
      displayName: 'Chief',
      role: 'chief',
      capabilities: ['intervene', 'approve'],
    })

    const state = await this.createRoom({
      slug: 'unicom-hub',
      title: 'UNICOM HUB',
      objective: 'Coordinate live agent communication, approval, and audit inside ABYSS.',
      mode: 'approval-gated',
      risk: 'medium',
      allowedPaths: ['docs/unicom/', 'packages/unicom/', 'apps/internal/unicom/'],
      forbiddenPaths: ['packages/sentra/'],
      actor: chief,
    })

    if (!state?.room) {
      return
    }

    await this.registerAgent({
      id: 'orchestrator-agent',
      displayName: 'Orchestrator Agent',
      role: 'orchestrator',
      capabilities: ['task-decompose', 'handoff'],
    })
    await this.registerAgent({
      id: 'builder-agent',
      displayName: 'Builder Agent',
      role: 'builder',
      capabilities: ['code-edit', 'completion-report'],
    })
    await this.registerAgent({
      id: 'tester-agent',
      displayName: 'Tester Agent',
      role: 'tester',
      capabilities: ['verification-run'],
    })

    const orchestrator: UnicomActor = {
      type: 'agent',
      id: 'orchestrator-agent',
      displayName: 'Orchestrator Agent',
      role: 'orchestrator',
      capabilities: ['task-decompose', 'handoff'],
    }
    const builder: UnicomActor = {
      type: 'agent',
      id: 'builder-agent',
      displayName: 'Builder Agent',
      role: 'builder',
      capabilities: ['code-edit', 'completion-report'],
    }
    const tester: UnicomActor = {
      type: 'agent',
      id: 'tester-agent',
      displayName: 'Tester Agent',
      role: 'tester',
      capabilities: ['verification-run'],
    }

    await this.publishEvent({
      id: randomUUID(),
      roomId: state.room.id,
      type: 'participant.joined',
      actor: chief,
      payload: { participant: chief },
      risk: 'low',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
    await this.publishEvent({
      id: randomUUID(),
      roomId: state.room.id,
      type: 'participant.joined',
      actor: orchestrator,
      payload: { participant: orchestrator },
      risk: 'low',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
    await this.publishEvent({
      id: randomUUID(),
      roomId: state.room.id,
      type: 'participant.joined',
      actor: builder,
      payload: { participant: builder },
      risk: 'low',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
    await this.publishEvent({
      id: randomUUID(),
      roomId: state.room.id,
      type: 'participant.joined',
      actor: tester,
      payload: { participant: tester },
      risk: 'low',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
    await this.sendMessage({
      roomId: state.room.id,
      actor: chief,
      body: 'Chief established UNICOM HUB. Keep communication inside ABYSS boundaries and leave crown jewels alone.',
    })
    await this.publishEvent({
      id: randomUUID(),
      roomId: state.room.id,
      taskId: 'demo-task-1',
      type: 'task.created',
      actor: orchestrator,
      payload: {
        task: {
          id: 'demo-task-1',
          objective: 'Build UNICOM protocol, policy, SDK, server, and cockpit in order.',
          scope: ['docs/unicom', 'packages/unicom', 'apps/internal/unicom'],
          nonScope: ['packages/sentra'],
          allowedPaths: ['docs/unicom/', 'packages/unicom/', 'apps/internal/unicom/'],
          forbiddenPaths: ['packages/sentra/'],
          verificationCommands: [
            'pnpm --filter @the-abyss/unicom-core test',
            'pnpm --filter @the-abyss/unicom-server test',
          ],
          acceptanceCriteria: ['All events auditable', 'High-risk work policy-gated'],
          risk: 'medium',
          status: 'active',
          assignedTo: [builder.id, tester.id],
        },
      },
      risk: 'medium',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
    await this.publishEvent({
      id: randomUUID(),
      roomId: state.room.id,
      type: 'agent.evidence',
      actor: tester,
      payload: {
        evidence: {
          id: randomUUID(),
          roomId: state.room.id,
          summary: 'Core reducer tests passed in the seeded demo room.',
          command: 'pnpm --filter @the-abyss/unicom-core test',
          filesTouched: ['packages/unicom/core/src/reducer.ts'],
          verificationCommands: ['pnpm --filter @the-abyss/unicom-core test'],
          createdAt: now(),
        },
      },
      risk: 'medium',
      requiresApproval: false,
      createdAt: now(),
      evidenceIds: [],
    })
    await this.publishEvent({
      id: randomUUID(),
      roomId: state.room.id,
      type: 'decision.proposed',
      actor: orchestrator,
      payload: {
        decision: {
          id: randomUUID(),
          roomId: state.room.id,
          title: 'Approve UNICOM persistence scaffolding',
          summary:
            'Need approval before crossing into durable event-store territory inside UNICOM HUB.',
          status: 'proposed',
          createdAt: now(),
          updatedAt: now(),
          requiresApproval: true,
        },
      },
      risk: 'high',
      requiresApproval: true,
      createdAt: now(),
      evidenceIds: [],
    })
  }
}
