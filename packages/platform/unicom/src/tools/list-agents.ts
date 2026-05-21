import type { AgentRegistry } from '../registry.js'

export async function handleListAgents(
  registry: AgentRegistry
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  return { content: [{ type: 'text', text: JSON.stringify(registry.list()) }] }
}
