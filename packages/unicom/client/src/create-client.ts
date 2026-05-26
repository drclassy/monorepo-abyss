import type { UnicomActor, UnicomEvent, UnicomRoomState } from '@the-abyss/unicom-core'
import { io, type Socket } from 'socket.io-client'

import type {
  CreateRoomRequest,
  CreateUnicomClientOptions,
  MessageRequest,
  RoomSummary,
  RoomSubscriptionUpdate,
} from './types'

export function createUnicomClient(options: CreateUnicomClientOptions = {}) {
  const baseUrl = options.baseUrl ?? 'http://127.0.0.1:4318'
  const socketUrl = options.socketUrl ?? baseUrl
  const socketPath = options.socketPath ?? '/socket.io'
  let socket: Socket | null = null

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `UNICOM request failed with status ${response.status}`)
    }

    return (await response.json()) as T
  }

  function ensureSocket(): Socket {
    if (!socket) {
      socket = io(socketUrl, {
        path: socketPath,
        transports: ['websocket'],
      })
    }
    return socket
  }

  return {
    health: {
      get: () => request<{ status: string; rooms: number; agents: number }>('/health'),
    },
    agents: {
      list: () =>
        request<Array<{ id: string; displayName: string; role?: string; capabilities: string[] }>>(
          '/agents'
        ),
      register: (agent: {
        id: string
        displayName: string
        role?: string
        capabilities: string[]
      }) =>
        request('/agents/register', {
          method: 'POST',
          body: JSON.stringify(agent),
        }),
    },
    rooms: {
      list: () => request<RoomSummary[]>('/rooms'),
      create: (input: CreateRoomRequest) =>
        request<UnicomRoomState>('/rooms', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      get: (roomId: string) =>
        request<
          UnicomRoomState & {
            decisionsList: unknown[]
            evidenceList: unknown[]
            interventionsList: unknown[]
          }
        >(`/rooms/${roomId}`),
      events: (roomId: string) => request<UnicomEvent[]>(`/rooms/${roomId}/events`),
      subscribe(roomId: string, handler: (update: RoomSubscriptionUpdate) => void): () => void {
        const connection = ensureSocket()
        const onState = (state: UnicomRoomState) => handler({ state })
        const onEvents = (events: UnicomEvent[]) => handler({ events })

        connection.emit('room:join', roomId)
        connection.on('room:state', onState)
        connection.on('room:events', onEvents)

        return () => {
          connection.emit('room:leave', roomId)
          connection.off('room:state', onState)
          connection.off('room:events', onEvents)
        }
      },
      subscribeList(handler: (rooms: RoomSummary[]) => void): () => void {
        const connection = ensureSocket()
        const onRooms = (rooms: RoomSummary[]) => handler(rooms)

        connection.on('rooms:list', onRooms)

        return () => {
          connection.off('rooms:list', onRooms)
        }
      },
    },
    events: {
      publish: (roomId: string, event: UnicomEvent) =>
        request<{ accepted: boolean; event: UnicomEvent; state: UnicomRoomState }>(
          `/rooms/${roomId}/events`,
          {
            method: 'POST',
            body: JSON.stringify({ event }),
          }
        ),
    },
    messages: {
      send: (roomId: string, input: MessageRequest) =>
        request<{ accepted: boolean; event: UnicomEvent; state: UnicomRoomState }>(
          `/rooms/${roomId}/messages`,
          {
            method: 'POST',
            body: JSON.stringify(input),
          }
        ),
    },
    interventions: {
      pause: (roomId: string, actor: UnicomActor, note?: string) =>
        request<{ accepted: boolean; event: UnicomEvent; state: UnicomRoomState }>(
          `/rooms/${roomId}/interventions/pause`,
          {
            method: 'POST',
            body: JSON.stringify({ actor, note }),
          }
        ),
      resume: (roomId: string, actor: UnicomActor, note?: string) =>
        request<{ accepted: boolean; event: UnicomEvent; state: UnicomRoomState }>(
          `/rooms/${roomId}/interventions/resume`,
          {
            method: 'POST',
            body: JSON.stringify({ actor, note }),
          }
        ),
      freeze: (roomId: string, actor: UnicomActor, note?: string) =>
        request<{ accepted: boolean; event: UnicomEvent; state: UnicomRoomState }>(
          `/rooms/${roomId}/interventions/freeze`,
          {
            method: 'POST',
            body: JSON.stringify({ actor, note }),
          }
        ),
    },
    decisions: {
      approve: (
        roomId: string,
        decisionId: string,
        actor: UnicomActor,
        targetEventId?: string,
        note?: string
      ) =>
        request<{ accepted: boolean; event: UnicomEvent; state: UnicomRoomState }>(
          `/rooms/${roomId}/decisions/${decisionId}/approve`,
          {
            method: 'POST',
            body: JSON.stringify({ actor, targetEventId, note }),
          }
        ),
      reject: (
        roomId: string,
        decisionId: string,
        actor: UnicomActor,
        targetEventId?: string,
        note?: string
      ) =>
        request<{ accepted: boolean; event: UnicomEvent; state: UnicomRoomState }>(
          `/rooms/${roomId}/decisions/${decisionId}/reject`,
          {
            method: 'POST',
            body: JSON.stringify({ actor, targetEventId, note }),
          }
        ),
    },
    evidence: {
      list: async (roomId: string) => {
        const state = await request<UnicomRoomState & { evidenceList: unknown[] }>(
          `/rooms/${roomId}`
        )
        return state.evidenceList
      },
    },
    close(): void {
      socket?.close()
      socket = null
    },
  }
}
