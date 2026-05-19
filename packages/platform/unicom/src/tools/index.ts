import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import type { MessageInbox } from '../inbox.js'
import type { AgentRegistry } from '../registry.js'
import { AgentStatusSchema } from '../types.js'

import { handleBroadcast } from './broadcast.js'
import { handleListAgents } from './list-agents.js'
import { handleReceiveMessages } from './receive-messages.js'
import { handleRegisterAgent } from './register-agent.js'
import { handleSendMessage } from './send-message.js'
import { handleUpdateStatus } from './update-status.js'

export {
  handleRegisterAgent,
  handleUpdateStatus,
  handleSendMessage,
  handleBroadcast,
  handleListAgents,
  handleReceiveMessages,
}

export function createTools(mcp: McpServer, registry: AgentRegistry, inbox: MessageInbox): void {
  mcp.tool(
    'register_agent',
    'Register this agent with UNICOM Hub',
    {
      id: z.string().describe('Unique agent id, e.g. "claude-code"'),
      displayName: z.string().describe('Human-readable name'),
      capabilities: z.array(z.string()).describe('Agent capabilities list'),
    },
    (p) => handleRegisterAgent(registry, inbox, p)
  )

  mcp.tool(
    'update_status',
    'Update status — auto-broadcasts to all agents',
    {
      id: z.string().describe('Agent id to update'),
      status: AgentStatusSchema.describe('idle | streaming | busy'),
    },
    (p) => handleUpdateStatus(registry, inbox, p)
  )

  mcp.tool(
    'send_message',
    'Send a message to a specific agent',
    {
      from: z.string().describe('Sender agent id'),
      to: z.string().describe('Target agent id or "broadcast"'),
      content: z.string().describe('Message body (markdown ok)'),
      replyTo: z.string().optional().describe('Optional: id of message being replied to'),
    },
    (p) => handleSendMessage(registry, inbox, p)
  )

  mcp.tool(
    'broadcast',
    'Send a message to all connected agents',
    {
      from: z.string().describe('Sender agent id'),
      content: z.string().describe('Message body'),
    },
    (p) => handleBroadcast(registry, inbox, p)
  )

  mcp.tool('list_agents', 'List all agents with live status', {}, () => handleListAgents(registry))

  mcp.tool(
    'receive_messages',
    'Drain and return pending messages for an agent',
    {
      agentId: z.string().describe('Your agent id'),
    },
    (p) => handleReceiveMessages(inbox, p)
  )
}
