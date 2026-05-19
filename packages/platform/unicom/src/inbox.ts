import type { UNICOMMessage } from './types.js'

export class MessageInbox {
  private queues = new Map<string, UNICOMMessage[]>()

  enqueue(agentId: string, message: UNICOMMessage): void {
    const queue = this.queues.get(agentId) ?? []
    queue.push(message)
    this.queues.set(agentId, queue)
  }

  drain(agentId: string): UNICOMMessage[] {
    const messages = this.queues.get(agentId) ?? []
    this.queues.set(agentId, [])
    return messages
  }

  clear(agentId: string): void {
    this.queues.delete(agentId)
  }
}
