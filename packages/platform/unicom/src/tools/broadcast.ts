import type { MessageInbox } from '../inbox.js'
import type { AgentRegistry } from '../registry.js'
import { routeMessage } from '../router.js'

export async function handleBroadcast(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { from: string; content: string }
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const msg = routeMessage(registry, inbox, params.from, 'broadcast', params.content)
  return { content: [{ type: 'text', text: JSON.stringify(msg) }] }
}
