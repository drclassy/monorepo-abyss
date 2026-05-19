import { describe, it, expect } from 'vitest'

import { MessageInbox } from '../src/inbox.js'
import { AgentRegistry } from '../src/registry.js'
import {
  handleRegisterAgent,
  handleUpdateStatus,
  handleSendMessage,
  handleBroadcast,
  handleListAgents,
  handleReceiveMessages,
} from '../src/tools/index.js'

function setup() {
  return { registry: new AgentRegistry(), inbox: new MessageInbox() }
}

describe('handleRegisterAgent', () => {
  it('registers agent and returns JSON entry', async () => {
    const { registry, inbox } = setup()
    const result = await handleRegisterAgent(registry, inbox, {
      id: 'claude-code',
      displayName: 'Claude Code',
      capabilities: ['review'],
    })
    const entry = JSON.parse(result.content[0].text)
    expect(entry.id).toBe('claude-code')
    expect(entry.status).toBe('connected')
    expect(registry.list()).toHaveLength(1)
  })
})

describe('handleUpdateStatus', () => {
  it('updates status and broadcasts status_update to other agents', async () => {
    const { registry, inbox } = setup()
    registry.register('claude-code', 'C', [])
    registry.register('roocode', 'R', [])
    const result = await handleUpdateStatus(registry, inbox, { id: 'claude-code', status: 'busy' })
    const entry = JSON.parse(result.content[0].text)
    expect(entry.status).toBe('busy')
    const rooMessages = inbox.drain('roocode')
    expect(rooMessages[0]?.type).toBe('status_update')
  })

  it('returns error text for unknown agent', async () => {
    const { registry, inbox } = setup()
    const result = await handleUpdateStatus(registry, inbox, { id: 'ghost', status: 'idle' })
    expect(result.content[0].text).toContain('not found')
  })
})

describe('handleSendMessage', () => {
  it('routes message and delivers to target inbox', async () => {
    const { registry, inbox } = setup()
    registry.register('claude-code', 'C', [])
    const result = await handleSendMessage(registry, inbox, {
      from: 'codex',
      to: 'claude-code',
      content: 'review src/foo.ts',
    })
    const msg = JSON.parse(result.content[0].text)
    expect(msg.from).toBe('codex')
    expect(inbox.drain('claude-code')).toHaveLength(1)
  })
})

describe('handleBroadcast', () => {
  it('delivers to all agents except sender', async () => {
    const { registry, inbox } = setup()
    registry.register('a', 'A', [])
    registry.register('b', 'B', [])
    await handleBroadcast(registry, inbox, { from: 'system', content: 'hello all' })
    expect(inbox.drain('a')).toHaveLength(1)
    expect(inbox.drain('b')).toHaveLength(1)
  })
})

describe('handleListAgents', () => {
  it('returns JSON array of registered agents', async () => {
    const { registry } = setup()
    registry.register('x', 'X', [])
    registry.register('y', 'Y', [])
    const result = await handleListAgents(registry)
    expect(JSON.parse(result.content[0].text)).toHaveLength(2)
  })
})

describe('handleReceiveMessages', () => {
  it('drains inbox and returns messages, then empty on second call', async () => {
    const { registry, inbox } = setup()
    registry.register('claude-code', 'C', [])
    await handleSendMessage(registry, inbox, { from: 'codex', to: 'claude-code', content: 'msg1' })
    const result = await handleReceiveMessages(inbox, { agentId: 'claude-code' })
    expect(JSON.parse(result.content[0].text)).toHaveLength(1)
    const result2 = await handleReceiveMessages(inbox, { agentId: 'claude-code' })
    expect(JSON.parse(result2.content[0].text)).toHaveLength(0)
  })
})
