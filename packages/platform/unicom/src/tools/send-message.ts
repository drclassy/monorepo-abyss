import type { MessageInbox } from '../inbox.js'
import type { AgentRegistry } from '../registry.js'
import { routeMessage } from '../router.js'

export async function handleSendMessage(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { from: string; to: string; content: string; replyTo?: string }
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const msg = routeMessage(registry, inbox, params.from, params.to, params.content, {
    replyTo: params.replyTo,
  })
  return { content: [{ type: 'text', text: JSON.stringify(msg) }] }
}
