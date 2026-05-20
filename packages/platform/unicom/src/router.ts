import { randomUUID } from 'node:crypto'

import { recordFeedMessage } from './feed.js'
import type { MessageInbox } from './inbox.js'
import type { AgentRegistry } from './registry.js'
import type { SseManager } from './sse-manager.js'
import type { UNICOMMessage } from './types.js'

export interface RouteOptions {
  replyTo?: string
  type?: UNICOMMessage['type']
  sseManager?: SseManager
}

function deliver(
  agentId: string,
  message: UNICOMMessage,
  type: UNICOMMessage['type'],
  inbox: MessageInbox,
  sseManager?: SseManager
): void {
  if (sseManager?.isConnected(agentId)) {
    try {
      const pushed = sseManager.push(agentId, type, message)
      if (pushed) return
    } catch {
      // fall through to inbox on error
    }
  }
  inbox.enqueue(agentId, message)
}

export function routeMessage(
  registry: AgentRegistry,
  inbox: MessageInbox,
  from: string,
  to: string,
  content: string,
  options: RouteOptions = {}
): UNICOMMessage {
  const { replyTo, type = 'message', sseManager } = options

  const message: UNICOMMessage = {
    id: randomUUID(),
    from,
    to,
    content,
    type,
    replyTo,
    timestamp: Date.now(),
  }

  if (to === 'broadcast') {
    for (const agent of registry.list()) {
      if (agent.id !== from) {
        deliver(agent.id, message, type, inbox, sseManager)
      }
    }
  } else {
    deliver(to, message, type, inbox, sseManager)
  }

  recordFeedMessage(message)

  return message
}
