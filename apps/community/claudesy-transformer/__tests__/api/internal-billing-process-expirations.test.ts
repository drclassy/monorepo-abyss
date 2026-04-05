import { beforeEach, describe, expect, it, vi } from 'vitest'

const subscriptionServiceMock = vi.hoisted(() => ({
  processExpiredSubscriptions: vi.fn(),
}))

vi.mock('@/lib/billing/subscription-service', () => subscriptionServiceMock)

import { POST } from '@/app/api/internal/billing/process-expirations/route'

describe('internal billing expiration processor route', () => {
  beforeEach(() => {
    subscriptionServiceMock.processExpiredSubscriptions.mockReset()
    process.env.SUBSCRIPTION_EXPIRY_CRON_SECRET = 'billing-secret'
  })

  it('rejects unauthorized requests', async () => {
    const response = await POST(
      new Request('http://localhost:3003/api/internal/billing/process-expirations', {
        method: 'POST',
      })
    )

    expect(response.status).toBe(401)
  })

  it('processes expired subscriptions for authorized requests', async () => {
    subscriptionServiceMock.processExpiredSubscriptions.mockResolvedValue(3)

    const response = await POST(
      new Request('http://localhost:3003/api/internal/billing/process-expirations', {
        method: 'POST',
        headers: {
          authorization: 'Bearer billing-secret',
        },
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ processed: 3 })
  })

  it('returns 500 when processing fails', async () => {
    subscriptionServiceMock.processExpiredSubscriptions.mockRejectedValue(
      new Error('db unavailable')
    )

    const response = await POST(
      new Request('http://localhost:3003/api/internal/billing/process-expirations', {
        method: 'POST',
        headers: {
          authorization: 'Bearer billing-secret',
        },
      })
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      error: 'Subscription expiration processing failed',
    })
  })
})
