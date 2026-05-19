import type { MessageInbox } from '../inbox.js'
import type { AgentRegistry } from '../registry.js'
import { routeMessage } from '../router.js'
import type { AgentStatus } from '../types.js'

export async function handleUpdateStatus(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { id: string; status: AgentStatus }
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const updated = registry.updateStatus(params.id, params.status)
  if (!updated) {
    return { content: [{ type: 'text', text: `Agent '${params.id}' not found` }] }
  }
  routeMessage(
    registry,
    inbox,
    'system',
    'broadcast',
    `${params.id} status: ${params.status}`,
    undefined,
    'status_update'
  )
  return { content: [{ type: 'text', text: JSON.stringify(updated) }] }
}
