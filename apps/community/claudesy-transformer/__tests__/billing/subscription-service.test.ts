import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  payment: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  subscription: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
}))

const adminMock = vi.hoisted(() => ({
  auth: {
    admin: {
      updateUserById: vi.fn(),
    },
  },
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(() => adminMock),
}))

vi.mock('@/lib/billing/xendit-client', () => ({
  createInvoice: vi.fn(),
}))

import {
  activateSubscription,
  handlePaymentFailed,
  processExpiredSubscriptions,
} from '@/lib/billing/subscription-service'

describe('subscription service reliability', () => {
  beforeEach(() => {
    prismaMock.payment.findUnique.mockReset()
    prismaMock.payment.update.mockReset()
    prismaMock.subscription.findMany.mockReset()
    prismaMock.subscription.update.mockReset()
    adminMock.auth.admin.updateUserById.mockReset()
  })

  it('treats duplicate paid webhooks as a no-op', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      gatewayPaymentId: 'pay-1',
      status: 'PAID',
      gatewayResponse: {
        requestedTier: 'PRO',
        requestedInterval: 'MONTHLY',
      },
      subscriptionId: 'sub-1',
      subscription: {
        user: {
          supabaseId: 'sup-1',
        },
      },
    })

    await activateSubscription({
      gatewayPaymentId: 'pay-1',
      paymentMethod: 'BCA',
      paidAmount: 49000,
    })

    expect(prismaMock.payment.update).not.toHaveBeenCalled()
    expect(prismaMock.subscription.update).not.toHaveBeenCalled()
    expect(adminMock.auth.admin.updateUserById).not.toHaveBeenCalled()
  })

  it('preserves requested tier metadata when activation succeeds', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      gatewayPaymentId: 'pay-2',
      status: 'PENDING',
      gatewayResponse: {
        requestedTier: 'TIM',
        requestedInterval: 'ANNUAL',
      },
      subscriptionId: 'sub-2',
      subscription: {
        user: {
          supabaseId: 'sup-2',
        },
      },
    })
    prismaMock.payment.update.mockResolvedValue(undefined)
    prismaMock.subscription.update.mockResolvedValue(undefined)
    adminMock.auth.admin.updateUserById.mockResolvedValue(undefined)

    await activateSubscription({
      gatewayPaymentId: 'pay-2',
      paymentMethod: 'QRIS',
      paidAmount: 149000,
    })

    expect(prismaMock.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { gatewayPaymentId: 'pay-2' },
        data: expect.objectContaining({
          status: 'PAID',
          gatewayResponse: expect.objectContaining({
            requestedTier: 'TIM',
            requestedInterval: 'ANNUAL',
            paymentMethod: 'QRIS',
            paidAmount: 149000,
          }),
        }),
      })
    )
    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tier: 'TIM',
          billingInterval: 'ANNUAL',
        }),
      })
    )
  })

  it('does not rewrite payments already marked with the same failed status', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      gatewayPaymentId: 'pay-3',
      status: 'FAILED',
    })

    await handlePaymentFailed('pay-3', 'FAILED')

    expect(prismaMock.payment.update).not.toHaveBeenCalled()
  })

  it('downgrades expired canceled and past-due subscriptions to gratis', async () => {
    prismaMock.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-expired-1',
        user: {
          supabaseId: 'sup-expired-1',
        },
      },
      {
        id: 'sub-expired-2',
        user: {
          supabaseId: 'sup-expired-2',
        },
      },
    ])
    prismaMock.subscription.update.mockResolvedValue(undefined)
    adminMock.auth.admin.updateUserById.mockResolvedValue(undefined)

    const processed = await processExpiredSubscriptions()

    expect(processed).toBe(2)
    expect(prismaMock.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['CANCELED', 'PAST_DUE'] },
          currentPeriodEnd: { lt: expect.any(Date) },
        }),
        include: { user: true },
      })
    )
    expect(prismaMock.subscription.update).toHaveBeenCalledTimes(2)
    expect(prismaMock.subscription.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'sub-expired-1' },
      data: { tier: 'GRATIS', status: 'EXPIRED' },
    })
    expect(prismaMock.subscription.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'sub-expired-2' },
      data: { tier: 'GRATIS', status: 'EXPIRED' },
    })
    expect(adminMock.auth.admin.updateUserById).toHaveBeenCalledTimes(2)
    expect(adminMock.auth.admin.updateUserById).toHaveBeenNthCalledWith(
      1,
      'sup-expired-1',
      { app_metadata: { tier: 'GRATIS' } }
    )
    expect(adminMock.auth.admin.updateUserById).toHaveBeenNthCalledWith(
      2,
      'sup-expired-2',
      { app_metadata: { tier: 'GRATIS' } }
    )
  })
})
