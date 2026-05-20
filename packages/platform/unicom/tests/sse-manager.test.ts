import type http from 'node:http'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SseManager } from '../src/sse-manager.js'

function makeMockRes() {
  const written: string[] = []
  return {
    writeHead: vi.fn(),
    write: vi.fn((chunk: string) => {
      written.push(chunk)
      return true
    }),
    end: vi.fn(),
    on: vi.fn(),
    writableEnded: false,
    headersSent: false,
    _written: written,
  } as unknown as http.ServerResponse & { _written: string[] }
}

describe('SseManager', () => {
  let manager: SseManager

  beforeEach(() => {
    manager = new SseManager()
  })

  afterEach(() => {
    manager.dispose()
  })

  it('isConnected() returns false when no agent is registered', () => {
    expect(manager.isConnected('claude-code')).toBe(false)
  })

  it('connect() sets headers and marks agent as connected', () => {
    const res = makeMockRes()
    manager.connect('claude-code', res)
    expect(manager.isConnected('claude-code')).toBe(true)
    expect(res.writeHead).toHaveBeenCalledWith(
      200,
      expect.objectContaining({
        'Content-Type': 'text/event-stream',
      })
    )
  })

  it('push() writes SSE event to response', () => {
    const res = makeMockRes()
    manager.connect('claude-code', res)
    const pushed = manager.push('claude-code', 'message', { content: 'hello' })
    expect(pushed).toBe(true)
    const written = res._written.join('')
    expect(written).toContain('event: message')
    expect(written).toContain('"content":"hello"')
  })

  it('push() returns false when agent is not connected', () => {
    const pushed = manager.push('ghost', 'message', { content: 'hello' })
    expect(pushed).toBe(false)
  })

  it('broadcast() pushes to all connected agents except excludeId', () => {
    const resA = makeMockRes()
    const resB = makeMockRes()
    const resC = makeMockRes()
    manager.connect('a', resA)
    manager.connect('b', resB)
    manager.connect('c', resC)
    manager.broadcast('message', { content: 'hi all' }, 'a')
    expect(resA._written).toHaveLength(0)
    expect(resB._written.join('')).toContain('hi all')
    expect(resC._written.join('')).toContain('hi all')
  })

  it('disconnect() removes agent and returns false on subsequent push', () => {
    const res = makeMockRes()
    manager.connect('claude-code', res)
    manager.disconnect('claude-code')
    expect(manager.isConnected('claude-code')).toBe(false)
    expect(manager.push('claude-code', 'msg', {})).toBe(false)
  })

  it('connecting the same agentId twice closes the first connection', () => {
    const res1 = makeMockRes()
    const res2 = makeMockRes()
    manager.connect('claude-code', res1)
    manager.connect('claude-code', res2)
    expect(res1.end).toHaveBeenCalled()
    expect(manager.isConnected('claude-code')).toBe(true)
  })
})
