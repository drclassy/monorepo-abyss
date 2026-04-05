import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  rateLimitCounter: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}))

import { consumeSharedRateLimit } from '@/lib/auth/shared-rate-limit'

describe('shared rate limit', () => {
  beforeEach(() => {
    prismaMock.rateLimitCounter.findUnique.mockReset()
    prismaMock.rateLimitCounter.create.mockReset()
    prismaMock.rateLimitCounter.update.mockReset()
    prismaMock.rateLimitCounter.deleteMany.mockReset()
    vi.spyOn(Math, 'random').mockReturnValue(1)
  })

  it('creates a new bucket on the first request inside the window', async () => {
    prismaMock.rateLimitCounter.findUnique.mockResolvedValue(null)

    const result = await consumeSharedRateLimit({
      action: 'REGISTER_IP',
      scope: 'IP',
      rawKey: '10.0.0.1',
      rule: { limit: 5, windowMs: 900000 },
      now: new Date('2026-03-22T12:07:00.000Z'),
    })

    expect(result).toEqual({ allowed: true })
    expect(prismaMock.rateLimitCounter.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'REGISTER_IP',
          scope: 'IP',
          count: 1,
        }),
      })
    )
  })

  it('increments an existing bucket when below the limit', async () => {
    prismaMock.rateLimitCounter.findUnique.mockResolvedValue({
      id: 'bucket-1',
      count: 2,
      windowEnd: new Date('2026-03-22T12:15:00.000Z'),
    })

    const result = await consumeSharedRateLimit({
      action: 'FORGOT_PASSWORD_EMAIL',
      scope: 'EMAIL',
      rawKey: 'user@example.com',
      rule: { limit: 3, windowMs: 3600000 },
      now: new Date('2026-03-22T12:20:00.000Z'),
    })

    expect(result).toEqual({ allowed: true })
    expect(prismaMock.rateLimitCounter.update).toHaveBeenCalledWith({
      where: { id: 'bucket-1' },
      data: {
        count: {
          increment: 1,
        },
      },
    })
  })

  it('returns retry-after when the shared bucket is exhausted', async () => {
    prismaMock.rateLimitCounter.findUnique.mockResolvedValue({
      id: 'bucket-2',
      count: 3,
      windowEnd: new Date('2026-03-22T13:00:00.000Z'),
    })

    const result = await consumeSharedRateLimit({
      action: 'FORGOT_PASSWORD_EMAIL',
      scope: 'EMAIL',
      rawKey: 'user@example.com',
      rule: { limit: 3, windowMs: 3600000 },
      now: new Date('2026-03-22T12:30:00.000Z'),
    })

    expect(result).toEqual({ allowed: false, retryAfterSeconds: 1800 })
    expect(prismaMock.rateLimitCounter.update).not.toHaveBeenCalled()
  })
})
