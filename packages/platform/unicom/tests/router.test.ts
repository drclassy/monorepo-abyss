import { describe, it, expect, vi } from 'vitest'

import { MessageInbox } from '../src/inbox.js'
import { AgentRegistry } from '../src/registry.js'
import { routeMessage } from '../src/router.js'
import type { SseManager } from '../src/sse-manager.js'

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

describe('routeMessage with SseManager', () => {
  it('delivers unicast via SSE when agent is connected', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('claude-code', 'Claude Code', [])

    const pushed: Array<{ agentId: string; event: string; data: unknown }> = []
    const sseManager = {
      isConnected: (id: string) => id === 'claude-code',
      push: (agentId: string, event: string, data: unknown) => {
        pushed.push({ agentId, event, data })
        return true
      },
    }

    routeMessage(
      registry,
      inbox,
      'codex',
      'claude-code',
      'hello',
      undefined,
      'message',
      sseManager as unknown as SseManager
    )

    expect(pushed).toHaveLength(1)
    expect(pushed[0].agentId).toBe('claude-code')
    expect(pushed[0].event).toBe('message')
    // inbox must be empty — delivery was via SSE
    expect(inbox.drain('claude-code')).toHaveLength(0)
  })

  it('falls back to inbox when agent is offline', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('claude-code', 'Claude Code', [])

    const sseManager = {
      isConnected: (_id: string) => false,
      push: vi.fn(),
    }

    routeMessage(
      registry,
      inbox,
      'codex',
      'claude-code',
      'hello',
      undefined,
      'message',
      sseManager as unknown as SseManager
    )

    expect(sseManager.push).not.toHaveBeenCalled()
    expect(inbox.drain('claude-code')).toHaveLength(1)
  })

  it('broadcast: SSE for online agents, inbox for offline', () => {
    const registry = new AgentRegistry()
    const inbox = new MessageInbox()
    registry.register('agent-online', 'Online', [])
    registry.register('agent-offline', 'Offline', [])
    registry.register('sender', 'Sender', [])

    const pushed: string[] = []
    const sseManager = {
      isConnected: (id: string) => id === 'agent-online',
      push: (agentId: string) => {
        pushed.push(agentId)
        return true
      },
    }

    routeMessage(
      registry,
      inbox,
      'sender',
      'broadcast',
      'hi',
      undefined,
      'message',
      sseManager as unknown as SseManager
    )

    expect(pushed).toContain('agent-online')
    expect(inbox.drain('agent-offline')).toHaveLength(1)
    expect(inbox.drain('sender')).toHaveLength(0) // sender excluded from broadcast
  })
})
