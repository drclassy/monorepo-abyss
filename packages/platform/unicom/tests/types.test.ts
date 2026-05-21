// packages/platform/unicom/tests/types.test.ts
import { describe, it, expect } from 'vitest'

import { AgentEntrySchema, UNICOMMessageSchema } from '../src/types.js'

describe('AgentEntrySchema', () => {
  it('parses a valid agent entry', () => {
    const result = AgentEntrySchema.safeParse({
      id: 'claude-code',
      displayName: 'Claude Code',
      capabilities: ['review', 'edit'],
      status: 'idle',
      connectedAt: 1000,
      lastSeen: 2000,
    })
    expect(result.success).toBe(true)
  })

  it('rejects unknown status values', () => {
    const result = AgentEntrySchema.safeParse({
      id: 'x',
      displayName: 'X',
      capabilities: [],
      status: 'unknown',
      connectedAt: 0,
      lastSeen: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('UNICOMMessageSchema', () => {
  it('parses a valid unicast message', () => {
    const result = UNICOMMessageSchema.safeParse({
      id: 'abc',
      from: 'codex',
      to: 'claude-code',
      content: 'hello',
      type: 'message',
      timestamp: 1000,
    })
    expect(result.success).toBe(true)
  })

  it('parses broadcast target', () => {
    const result = UNICOMMessageSchema.safeParse({
      id: 'abc',
      from: 'codex',
      to: 'broadcast',
      content: 'hi all',
      type: 'message',
      timestamp: 1000,
    })
    expect(result.success).toBe(true)
  })
})
