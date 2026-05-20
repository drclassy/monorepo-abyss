import { beforeEach, describe, expect, it, vi } from 'vitest'

import { KafkaService } from './kafka.service'

const sendMock = vi.fn().mockResolvedValue(undefined)
const connectMock = vi.fn().mockResolvedValue(undefined)
const disconnectMock = vi.fn().mockResolvedValue(undefined)

vi.mock('kafkajs', () => ({
  Kafka: class {
    producer() {
      return {
        connect: connectMock,
        disconnect: disconnectMock,
        send: sendMock,
      }
    }
  },
}))

describe('KafkaService', () => {
  beforeEach(() => {
    sendMock.mockClear()
    connectMock.mockClear()
    disconnectMock.mockClear()
  })

  it('emit sends JSON payload to topic', async () => {
    const svc = new KafkaService()
    await svc.onModuleInit()
    await svc.emit('test.topic', { id: 1 })

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: 'test.topic',
        messages: [{ value: JSON.stringify({ id: 1 }) }],
      })
    )

    await svc.onModuleDestroy()
    expect(disconnectMock).toHaveBeenCalled()
  })
})
