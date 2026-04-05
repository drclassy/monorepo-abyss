import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  emailJob: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
}))

const loggerMock = vi.hoisted(() => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

const welcomeMock = vi.hoisted(() => ({
  sendWelcomeEmail: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/lib/logger', () => loggerMock)
vi.mock('@/lib/email/welcome', () => welcomeMock)

import { enqueueWelcomeEmail, processEmailQueue } from '@/lib/email/queue'

describe('email queue', () => {
  beforeEach(() => {
    prismaMock.emailJob.upsert.mockReset()
    prismaMock.emailJob.findMany.mockReset()
    prismaMock.emailJob.updateMany.mockReset()
    prismaMock.emailJob.update.mockReset()
    prismaMock.emailJob.deleteMany.mockReset()
    loggerMock.logger.error.mockReset()
    loggerMock.logger.warn.mockReset()
    welcomeMock.sendWelcomeEmail.mockReset()
    process.env.RESEND_API_KEY = 'resend-key'
    vi.spyOn(Math, 'random').mockReturnValue(1)
  })

  it('enqueues welcome emails with a stable idempotency key', async () => {
    await enqueueWelcomeEmail({
      userId: 'user-1',
      email: 'user@example.com',
      name: 'User',
    })

    expect(prismaMock.emailJob.upsert).toHaveBeenCalledWith({
      where: {
        idempotencyKey: 'welcome:user-1',
      },
      update: {
        toEmail: 'user@example.com',
        payload: { name: 'User' },
        status: 'PENDING',
        attempts: 0,
        maxAttempts: 5,
        nextAttemptAt: expect.any(Date),
        lastError: null,
      },
      create: {
        type: 'WELCOME',
        toEmail: 'user@example.com',
        payload: { name: 'User' },
        idempotencyKey: 'welcome:user-1',
        maxAttempts: 5,
      },
    })
  })

  it('marks claimed jobs as sent when delivery succeeds', async () => {
    prismaMock.emailJob.findMany.mockResolvedValue([
      {
        id: 'job-1',
        type: 'WELCOME',
        toEmail: 'user@example.com',
        payload: { name: 'User' },
        attempts: 0,
        maxAttempts: 5,
      },
    ])
    prismaMock.emailJob.updateMany.mockResolvedValue({ count: 1 })
    welcomeMock.sendWelcomeEmail.mockResolvedValue(undefined)

    const result = await processEmailQueue({
      now: new Date('2026-03-22T12:00:00.000Z'),
    })

    expect(result).toEqual({
      claimed: 1,
      sent: 1,
      failed: 0,
      retried: 0,
      skipped: 0,
    })
    expect(prismaMock.emailJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-1' },
        data: expect.objectContaining({
          status: 'SENT',
          sentAt: expect.any(Date),
        }),
      })
    )
  })

  it('reschedules failed jobs with backoff while attempts remain', async () => {
    prismaMock.emailJob.findMany.mockResolvedValue([
      {
        id: 'job-2',
        type: 'WELCOME',
        toEmail: 'user@example.com',
        payload: { name: 'User' },
        attempts: 1,
        maxAttempts: 5,
      },
    ])
    prismaMock.emailJob.updateMany.mockResolvedValue({ count: 1 })
    welcomeMock.sendWelcomeEmail.mockRejectedValue(new Error('temporary provider issue'))

    const result = await processEmailQueue({
      now: new Date('2026-03-22T12:00:00.000Z'),
    })

    expect(result).toEqual({
      claimed: 1,
      sent: 0,
      failed: 0,
      retried: 1,
      skipped: 0,
    })
    expect(prismaMock.emailJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-2' },
        data: expect.objectContaining({
          status: 'RETRYING',
          lastError: 'temporary provider issue',
          nextAttemptAt: expect.any(Date),
        }),
      })
    )
  })

  it('marks jobs as failed after the final allowed attempt', async () => {
    prismaMock.emailJob.findMany.mockResolvedValue([
      {
        id: 'job-3',
        type: 'WELCOME',
        toEmail: 'user@example.com',
        payload: { name: 'User' },
        attempts: 4,
        maxAttempts: 5,
      },
    ])
    prismaMock.emailJob.updateMany.mockResolvedValue({ count: 1 })
    welcomeMock.sendWelcomeEmail.mockRejectedValue(new Error('permanent failure'))

    const result = await processEmailQueue({
      now: new Date('2026-03-22T12:00:00.000Z'),
    })

    expect(result).toEqual({
      claimed: 1,
      sent: 0,
      failed: 1,
      retried: 0,
      skipped: 0,
    })
    expect(prismaMock.emailJob.update).toHaveBeenCalledWith({
      where: { id: 'job-3' },
      data: {
        status: 'FAILED',
        lastError: 'permanent failure',
      },
    })
  })
})
