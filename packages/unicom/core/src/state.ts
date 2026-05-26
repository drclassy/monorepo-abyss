import type {
  UnicomActor,
  UnicomCompletionClaim,
  UnicomDecision,
  UnicomEvidence,
  UnicomIntervention,
  UnicomMessage,
  UnicomRoom,
  UnicomRoomMode,
  UnicomRoomStatus,
  UnicomTask,
} from './schemas.js'

export interface UnicomRoomState {
  room: UnicomRoom | null
  status: UnicomRoomStatus
  mode: UnicomRoomMode
  participants: Record<string, UnicomActor>
  messages: UnicomMessage[]
  tasks: Record<string, UnicomTask>
  decisions: Record<string, UnicomDecision>
  interventions: UnicomIntervention[]
  evidence: Record<string, UnicomEvidence>
  completionClaims: UnicomCompletionClaim[]
  pendingApprovalEventIds: string[]
  blockedReasons: string[]
  lastEventAt?: string
}

export function createEmptyRoomState(): UnicomRoomState {
  return {
    room: null,
    status: 'idle',
    mode: 'collaborative',
    participants: {},
    messages: [],
    tasks: {},
    decisions: {},
    interventions: [],
    evidence: {},
    completionClaims: [],
    pendingApprovalEventIds: [],
    blockedReasons: [],
  }
}
