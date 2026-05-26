import type { UnicomActor, UnicomEvent, UnicomRoomState } from '@the-abyss/unicom-core'

export interface CreateUnicomClientOptions {
  baseUrl?: string
  socketUrl?: string
  socketPath?: string
}

export interface RoomSubscriptionUpdate {
  state?: UnicomRoomState
  events?: UnicomEvent[]
}

export interface RoomSummary {
  id: string
  slug: string
  title: string
  status: string
  mode: string
  participantCount: number
  pendingApprovalCount: number
  messageCount: number
  decisionCount: number
  lastEventAt?: string
}

export interface CreateRoomRequest {
  slug: string
  title: string
  description?: string
  objective?: string
  mode?: UnicomRoomState['mode']
  risk?: UnicomEvent['risk']
  allowedPaths?: string[]
  forbiddenPaths?: string[]
  actor: UnicomActor
}

export interface MessageRequest {
  actor: UnicomActor
  body: string
  kind?: 'note' | 'question' | 'proposal' | 'warning'
}
