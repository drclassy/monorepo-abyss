import type { MessageInbox } from '../inbox.js'

export async function handleReceiveMessages(
  inbox: MessageInbox,
  params: { agentId: string }
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  return { content: [{ type: 'text', text: JSON.stringify(inbox.drain(params.agentId)) }] }
}
