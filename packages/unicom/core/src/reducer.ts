import {
  AgentRegisteredPayloadSchema,
  CompletionClaimPayloadSchema,
  DecisionActionPayloadSchema,
  DecisionPayloadSchema,
  EvidencePayloadSchema,
  InterventionPayloadSchema,
  MessageSentPayloadSchema,
  ParticipantPayloadSchema,
  PolicyPayloadSchema,
  RoomCreatedPayloadSchema,
  TaskAssignmentPayloadSchema,
  TaskPayloadSchema,
  UnicomCompletionClaimSchema,
  type UnicomEvent,
} from './schemas.js'
import { createEmptyRoomState, type UnicomRoomState } from './state.js'

function addPendingApproval(state: UnicomRoomState, eventId: string): void {
  if (!state.pendingApprovalEventIds.includes(eventId)) {
    state.pendingApprovalEventIds.push(eventId)
    state.status = 'waiting-approval'
  }
}

function clearPendingApproval(state: UnicomRoomState, targetEventId?: string): void {
  if (!targetEventId) {
    return
  }
  state.pendingApprovalEventIds = state.pendingApprovalEventIds.filter((id) => id !== targetEventId)
  if (state.pendingApprovalEventIds.length === 0 && state.status === 'waiting-approval') {
    state.status = 'active'
  }
}

export function reduceRoomState(events: UnicomEvent[]): UnicomRoomState {
  const state = createEmptyRoomState()

  for (const event of events) {
    state.lastEventAt = event.createdAt

    if (event.requiresApproval) {
      addPendingApproval(state, event.id)
    }

    switch (event.type) {
      case 'room.created': {
        const room = RoomCreatedPayloadSchema.parse(event.payload)
        state.room = room
        state.mode = room.mode
        state.status = room.status
        break
      }
      case 'room.paused':
        state.status = 'paused'
        break
      case 'room.resumed':
        state.status = state.pendingApprovalEventIds.length > 0 ? 'waiting-approval' : 'active'
        break
      case 'room.frozen':
        state.mode = 'freeze'
        state.status = 'frozen'
        break
      case 'participant.joined': {
        const payload = ParticipantPayloadSchema.parse(event.payload)
        state.participants[payload.participant.id] = payload.participant
        break
      }
      case 'participant.left': {
        const payload = ParticipantPayloadSchema.parse(event.payload)
        const participantId = payload.participant.id
        const { [participantId]: _removed, ...remainingParticipants } = state.participants
        state.participants = remainingParticipants
        break
      }
      case 'agent.registered': {
        const payload = AgentRegisteredPayloadSchema.parse(event.payload)
        state.participants[payload.agent.id] = payload.agent
        break
      }
      case 'message.sent': {
        const payload = MessageSentPayloadSchema.parse(event.payload)
        state.messages.push(payload.message)
        break
      }
      case 'agent.evidence': {
        const payload = EvidencePayloadSchema.parse(event.payload)
        state.evidence[payload.evidence.id] = payload.evidence
        break
      }
      case 'agent.completion_claim': {
        const payload = CompletionClaimPayloadSchema.parse(event.payload)
        const claim = UnicomCompletionClaimSchema.parse({
          id: event.id,
          actorId: event.actor.id,
          createdAt: event.createdAt,
          evidenceIds: event.evidenceIds,
          ...payload,
        })
        state.completionClaims.push(claim)
        if (state.pendingApprovalEventIds.length === 0) {
          state.status = 'completed'
        }
        break
      }
      case 'task.created': {
        const payload = TaskPayloadSchema.parse(event.payload)
        state.tasks[payload.task.id] = payload.task
        break
      }
      case 'task.assigned': {
        const payload = TaskAssignmentPayloadSchema.parse(event.payload)
        const existing = state.tasks[payload.taskId]
        if (existing) {
          existing.assignedTo = payload.assigneeIds
          if (existing.status === 'planned') {
            existing.status = 'active'
          }
        }
        break
      }
      case 'task.blocked': {
        const payload = TaskAssignmentPayloadSchema.parse(event.payload)
        const existing = state.tasks[payload.taskId]
        if (existing) {
          existing.status = 'blocked'
        }
        state.status = 'blocked'
        break
      }
      case 'task.completed': {
        const payload = TaskAssignmentPayloadSchema.parse(event.payload)
        const existing = state.tasks[payload.taskId]
        if (existing) {
          existing.status = 'completed'
        }
        break
      }
      case 'decision.proposed': {
        const payload = DecisionPayloadSchema.parse(event.payload)
        state.decisions[payload.decision.id] = payload.decision
        break
      }
      case 'decision.approved': {
        const payload = DecisionActionPayloadSchema.parse(event.payload)
        const existing = state.decisions[payload.decisionId]
        if (existing) {
          existing.status = 'approved'
          existing.updatedAt = event.createdAt
        }
        clearPendingApproval(state, payload.targetEventId)
        break
      }
      case 'decision.rejected': {
        const payload = DecisionActionPayloadSchema.parse(event.payload)
        const existing = state.decisions[payload.decisionId]
        if (existing) {
          existing.status = 'rejected'
          existing.updatedAt = event.createdAt
        }
        clearPendingApproval(state, payload.targetEventId)
        state.status = 'blocked'
        break
      }
      case 'human.intervention': {
        const payload = InterventionPayloadSchema.parse(event.payload)
        state.interventions.push(payload.intervention)
        break
      }
      case 'policy.blocked': {
        const payload = PolicyPayloadSchema.parse(event.payload)
        state.blockedReasons.push(payload.reason)
        state.status = 'blocked'
        break
      }
      case 'system.error':
        state.status = 'failed'
        break
      default:
        break
    }
  }

  return state
}
