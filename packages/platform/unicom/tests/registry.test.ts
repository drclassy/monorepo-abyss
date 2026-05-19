import { describe, it, expect, beforeEach } from 'vitest'

import { AgentRegistry } from '../src/registry.js'

describe('AgentRegistry', () => {
  let registry: AgentRegistry
  beforeEach(() => {
    registry = new AgentRegistry()
  })

  it('register() creates entry with connected status', () => {
    const entry = registry.register('claude-code', 'Claude Code', ['review'])
    expect(entry.id).toBe('claude-code')
    expect(entry.status).toBe('connected')
    expect(entry.capabilities).toEqual(['review'])
    expect(entry.connectedAt).toBeGreaterThan(0)
  })

  it('list() returns all registered agents', () => {
    registry.register('a', 'A', [])
    registry.register('b', 'B', [])
    expect(registry.list()).toHaveLength(2)
  })

  it('updateStatus() changes agent status', () => {
    registry.register('claude-code', 'Claude Code', [])
    const updated = registry.updateStatus('claude-code', 'streaming')
    expect(updated?.status).toBe('streaming')
  })

  it('updateStatus() returns undefined for unknown agent', () => {
    expect(registry.updateStatus('ghost', 'idle')).toBeUndefined()
  })

  it('remove() deletes agent from registry', () => {
    registry.register('x', 'X', [])
    registry.remove('x')
    expect(registry.list()).toHaveLength(0)
  })

  it('evictStale() removes agents silent > 30s', () => {
    registry.register('old', 'Old', [])
    const entries = registry.list()
    const entry = entries[0]
    if (entry) {
      registry['agents'].set('old', { ...entry, lastSeen: Date.now() - 31_000 })
    }
    const evicted = registry.evictStale()
    expect(evicted).toContain('old')
    expect(registry.list()).toHaveLength(0)
  })
})
