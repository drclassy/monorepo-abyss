import { describe, it, expect } from 'vitest'

import { MessageInbox } from '../src/inbox.js'
import { AgentRegistry } from '../src/registry.js'
import { routeMessage } from '../src/router.js'

describe('routeMessage', () => {
  it('delivers unicast message to target inbox', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('claude-code', 'Claude Code', [])
    const msg = routeMessage(registry, inbox, 'codex', 'claude-code', 'review this')
    expect(msg.from).toBe('codex')
    expect(msg.to).toBe('claude-code')
    expect(msg.content).toBe('review this')
    expect(msg.id).toBeTruthy()
    expect(inbox.drain('claude-code')).toHaveLength(1)
  })

  it('broadcast delivers to all agents except sender', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('agent-a', 'A', [])
    registry.register('agent-b', 'B', [])
    registry.register('sender', 'Sender', [])
    routeMessage(registry, inbox, 'sender', 'broadcast', 'hi everyone')
    expect(inbox.drain('agent-a')).toHaveLength(1)
    expect(inbox.drain('agent-b')).toHaveLength(1)
    expect(inbox.drain('sender')).toHaveLength(0)
  })

  it('sets replyTo when provided', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('b', 'B', [])
    const msg = routeMessage(registry, inbox, 'a', 'b', 'reply', 'orig-id')
    expect(msg.replyTo).toBe('orig-id')
  })

  it('status_update type is preserved', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('b', 'B', [])
    const msg = routeMessage(registry, inbox, 'system', 'b', 'online', undefined, 'status_update')
    expect(msg.type).toBe('status_update')
  })
})
