import { randomUUID } from 'node:crypto'

import type { MessageInbox } from './inbox.js'
import type { AgentRegistry } from './registry.js'
import type { UNICOMMessage } from './types.js'

export function routeMessage(
  registry: AgentRegistry,
  inbox: MessageInbox,
  from: string,
  to: string,
  content: string,
  replyTo?: string,
  type: UNICOMMessage['type'] = 'message'
): UNICOMMessage {
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
        inbox.enqueue(agent.id, message)
      }
    }
  } else {
    inbox.enqueue(to, message)
  }

  return message
}
