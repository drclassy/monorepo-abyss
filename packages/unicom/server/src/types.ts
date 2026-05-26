import type {
  RiskLevel,
  UnicomActor,
  UnicomDecision,
  UnicomEvent,
  UnicomIntervention,
  UnicomRoom,
  UnicomRoomMode,
  UnicomRoomState,
} from '@the-abyss/unicom-core'

export interface CreateRoomInput {
  slug: string
  title: string
  description?: string
  objective?: string
  mode?: UnicomRoomMode
  risk?: RiskLevel
  allowedPaths?: string[]
  forbiddenPaths?: string[]
  actor: UnicomActor
}

export interface RoomSummary {
  id: string
  slug: string
  title: string
  status: UnicomRoomState['status']
  mode: UnicomRoomState['mode']
  participantCount: number
  pendingApprovalCount: number
  messageCount: number
  decisionCount: number
  lastEventAt?: string
}

export interface UnicomPublishResult {
  accepted: boolean
  event: UnicomEvent
  state: UnicomRoomState
}

export interface DecisionActionInput {
  roomId: string
  decisionId: string
  actor: UnicomActor
  targetEventId?: string
  note?: string
}

export interface InterventionCommandInput {
  roomId: string
  actor: UnicomActor
  note?: string
}

export interface RegisterAgentInput {
  id: string
  displayName: string
  role?: string
  capabilities: string[]
}

export interface MessageCommandInput {
  roomId: string
  actor: UnicomActor
  body: string
  kind?: 'note' | 'question' | 'proposal' | 'warning'
}

export function toRoomSummary(state: UnicomRoomState): RoomSummary {
  const room: UnicomRoom = state.room ?? {
    id: 'unknown',
    slug: 'unknown',
    title: 'Unknown Room',
    mode: state.mode,
    status: state.status,
    createdAt: '',
    updatedAt: '',
    risk: 'medium',
    allowedPaths: [],
    forbiddenPaths: [],
  }

  return {
    id: room.id,
    slug: room.slug,
    title: room.title,
    status: state.status,
    mode: state.mode,
    participantCount: Object.keys(state.participants).length,
    pendingApprovalCount: state.pendingApprovalEventIds.length,
    messageCount: state.messages.length,
    decisionCount: Object.keys(state.decisions).length,
    lastEventAt: state.lastEventAt,
  }
}

export function decisionListFromState(state: UnicomRoomState): UnicomDecision[] {
  return Object.values(state.decisions).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  )
}

export function evidenceListFromState(state: UnicomRoomState) {
  return Object.values(state.evidence).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  )
}

export function interventionListFromState(state: UnicomRoomState): UnicomIntervention[] {
  return [...state.interventions].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  )
}
