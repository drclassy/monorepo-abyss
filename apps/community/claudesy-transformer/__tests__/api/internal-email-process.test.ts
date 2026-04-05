import { beforeEach, describe, expect, it, vi } from 'vitest'

const emailQueueMock = vi.hoisted(() => ({
  processEmailQueue: vi.fn(),
}))

vi.mock('@/lib/email/queue', () => emailQueueMock)

import { POST } from '@/app/api/internal/email/process/route'

describe('internal email queue processor route', () => {
  beforeEach(() => {
    emailQueueMock.processEmailQueue.mockReset()
    process.env.EMAIL_QUEUE_CRON_SECRET = 'queue-secret'
  })

  it('rejects unauthorized requests', async () => {
    const response = await POST(
      new Request('http://localhost:3003/api/internal/email/process', {
        method: 'POST',
      })
    )

    expect(response.status).toBe(401)
  })

  it('processes the queue for authorized requests', async () => {
    emailQueueMock.processEmailQueue.mockResolvedValue({
      claimed: 1,
      sent: 1,
      failed: 0,
      retried: 0,
      skipped: 0,
    })

    const response = await POST(
      new Request('http://localhost:3003/api/internal/email/process', {
        method: 'POST',
        headers: {
          authorization: 'Bearer queue-secret',
        },
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      claimed: 1,
      sent: 1,
      failed: 0,
      retried: 0,
      skipped: 0,
    })
  })
})
