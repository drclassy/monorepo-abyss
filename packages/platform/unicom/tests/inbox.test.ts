import { describe, it, expect } from 'vitest'

import { MessageInbox } from '../src/inbox.js'
import type { UNICOMMessage } from '../src/types.js'

const makeMsg = (id: string, to: string): UNICOMMessage => ({
  id,
  from: 'sender',
  to,
  content: 'hello',
  type: 'message',
  timestamp: Date.now(),
})

describe('MessageInbox', () => {
  it('enqueue() adds message to agent queue', () => {
    const inbox = new MessageInbox()
    inbox.enqueue('claude-code', makeMsg('1', 'claude-code'))
    expect(inbox.drain('claude-code')).toHaveLength(1)
  })

  it('drain() empties the queue after returning messages', () => {
    const inbox = new MessageInbox()
    inbox.enqueue('x', makeMsg('1', 'x'))
    inbox.enqueue('x', makeMsg('2', 'x'))
    expect(inbox.drain('x')).toHaveLength(2)
    expect(inbox.drain('x')).toHaveLength(0)
  })

  it('drain() returns empty array for unknown agent', () => {
    expect(new MessageInbox().drain('ghost')).toEqual([])
  })

  it('clear() removes all messages for an agent', () => {
    const inbox = new MessageInbox()
    inbox.enqueue('y', makeMsg('1', 'y'))
    inbox.clear('y')
    expect(inbox.drain('y')).toHaveLength(0)
  })
})
