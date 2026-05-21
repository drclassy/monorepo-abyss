import type { MessageInbox } from '../inbox.js'
import type { AgentRegistry } from '../registry.js'

export async function handleRegisterAgent(
  registry: AgentRegistry,
  inbox: MessageInbox,
  params: { id: string; displayName: string; capabilities: string[] }
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const entry = registry.register(params.id, params.displayName, params.capabilities)
  inbox.drain(params.id) // ensure queue initialised
  return { content: [{ type: 'text', text: JSON.stringify(entry) }] }
}
