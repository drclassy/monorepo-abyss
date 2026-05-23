import type http from 'node:http'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SseManager } from '../src/sse-manager.js'

function makeMockRes() {
  const written: string[] = []
  const listeners: Record<string, Array<() => void>> = {}
  const res = {
    writeHead: vi.fn(),
    write: vi.fn((chunk: string) => {
      written.push(chunk)
      return true
    }),
    end: vi.fn(() => {
      res.writableEnded = true
      for (const cb of listeners['close'] ?? []) cb()
    }),
    on: vi.fn((event: string, cb: () => void) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(cb)
    }),
    writableEnded: false,
    headersSent: false,
    _written: written,
  } as unknown as http.ServerResponse & { _written: string[] }
  return res
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
    expect(resA._written.join('')).not.toContain('hi all')
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

  it('client-initiated close removes agent from connection map', () => {
    const res = makeMockRes()
    manager.connect('claude-code', res)
    expect(manager.isConnected('claude-code')).toBe(true)
    // simulate client dropping connection
    res.end()
    expect(manager.isConnected('claude-code')).toBe(false)
  })

  it('keepalive ping is emitted to all connected agents', () => {
    vi.useFakeTimers()
    // Create a fresh manager under fake timers so its setInterval is controlled
    const timerManager = new SseManager()
    const res = makeMockRes()
    timerManager.connect('claude-code', res)
    vi.advanceTimersByTime(15_000)
    timerManager.dispose()
    vi.useRealTimers()
    expect(res._written.join('')).toContain('event: ping')
  })

  it('dispose() ends all connections and clears the map', () => {
    const resA = makeMockRes()
    const resB = makeMockRes()
    manager.connect('a', resA)
    manager.connect('b', resB)
    manager.dispose()
    expect(resA.end).toHaveBeenCalled()
    expect(resB.end).toHaveBeenCalled()
    expect(manager.isConnected('a')).toBe(false)
    expect(manager.isConnected('b')).toBe(false)
  })
})
