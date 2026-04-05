import { beforeEach, describe, expect, it, vi } from 'vitest'

const verifyWebhookTokenMock = vi.hoisted(() => vi.fn())
const activateSubscriptionMock = vi.hoisted(() => vi.fn())
const handlePaymentFailedMock = vi.hoisted(() => vi.fn())
const loggerMock = vi.hoisted(() => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('@/lib/billing/xendit-client', () => ({
  verifyWebhookToken: verifyWebhookTokenMock,
}))

vi.mock('@/lib/billing/subscription-service', () => ({
  activateSubscription: activateSubscriptionMock,
  handlePaymentFailed: handlePaymentFailedMock,
}))

vi.mock('@/lib/logger', () => loggerMock)

import { POST } from '@/app/api/billing/webhook/route'

describe('billing webhook reliability', () => {
  beforeEach(() => {
    verifyWebhookTokenMock.mockReset()
    activateSubscriptionMock.mockReset()
    handlePaymentFailedMock.mockReset()
    loggerMock.logger.error.mockReset()
    loggerMock.logger.warn.mockReset()
  })

  it('returns 500 when payment activation fails internally', async () => {
    verifyWebhookTokenMock.mockReturnValue(true)
    activateSubscriptionMock.mockRejectedValue(new Error('database unavailable'))

    const response = await POST(
      new Request('http://localhost:3003/api/billing/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-callback-token': 'valid-token',
        },
        body: JSON.stringify({
          id: 'pay-1',
          external_id: 'INV-1',
          status: 'PAID',
          amount: 49000,
          paid_amount: 49000,
          payment_method: 'BCA',
        }),
      })
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Processing failed' })
  })

  it('passes failure status through to the payment failure handler', async () => {
    verifyWebhookTokenMock.mockReturnValue(true)
    handlePaymentFailedMock.mockResolvedValue(undefined)

    const response = await POST(
      new Request('http://localhost:3003/api/billing/webhook', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-callback-token': 'valid-token',
        },
        body: JSON.stringify({
          id: 'pay-2',
          external_id: 'INV-2',
          status: 'EXPIRED',
          amount: 149000,
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(handlePaymentFailedMock).toHaveBeenCalledWith('pay-2', 'EXPIRED')
  })
})
