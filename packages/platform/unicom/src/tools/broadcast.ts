import type { MessageInbox } from '../inbox.js'
import type { AgentRegistry } from '../registry.js'
import { routeMessage } from '../router.js'
import type { SseManager } from '../sse-manager.js'

export async function handleBroadcast(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { from: string; content: string },
  sseManager?: SseManager
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const msg = routeMessage(registry, inbox, params.from, 'broadcast', params.content, {
    sseManager,
  })
  return { content: [{ type: 'text', text: JSON.stringify(msg) }] }
}
