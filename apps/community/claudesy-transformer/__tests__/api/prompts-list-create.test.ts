import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => {
  class UnauthorizedError extends Error {}
  class AppUserNotFoundError extends Error {}

  return {
    currentUser: { id: 'user-a' },
    nextError: null as Error | null,
    UnauthorizedError,
    AppUserNotFoundError,
  }
})

const prismaMock = vi.hoisted(() => ({
  prompt: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
}))

const loggerMock = vi.hoisted(() => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('@/lib/auth/require-current-user', () => ({
  requireCurrentAppUser: vi.fn(async () => {
    if (authState.nextError) {
      throw authState.nextError
    }
    return authState.currentUser
  }),
  UnauthorizedError: authState.UnauthorizedError,
  AppUserNotFoundError: authState.AppUserNotFoundError,
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/lib/logger', () => loggerMock)

import { GET, POST } from '@/app/api/prompts/route'

describe('prompt list and create routes', () => {
  beforeEach(() => {
    authState.currentUser = { id: 'user-a' }
    authState.nextError = null
    prismaMock.prompt.findMany.mockReset()
    prismaMock.prompt.count.mockReset()
    prismaMock.prompt.create.mockReset()
    loggerMock.logger.error.mockReset()
  })

  it('scopes prompt listing to the current user', async () => {
    prismaMock.prompt.findMany.mockResolvedValue([
      {
        id: 'prompt-1',
        rawInput: 'raw',
        optimizedText: 'optimized',
        taskType: 'GENERAL',
        tone: 'PROFESSIONAL',
        format: 'STRUCTURED',
        targetLlm: 'CLAUDE',
        tags: ['alpha'],
        isPublic: false,
        createdAt: new Date('2026-03-22T00:00:00.000Z'),
        updatedAt: new Date('2026-03-22T00:00:00.000Z'),
      },
    ])
    prismaMock.prompt.count.mockResolvedValue(1)

    const response = await GET(
      new Request('http://localhost:3003/api/prompts?page=2&limit=10&taskType=GENERAL&tag=alpha&search=raw')
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(prismaMock.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          userId: 'user-a',
          taskType: 'GENERAL',
          tags: { has: 'alpha' },
        }),
        skip: 10,
        take: 10,
      })
    )
    expect(prismaMock.prompt.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          userId: 'user-a',
        }),
      })
    )
    expect(payload.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    })
  })

  it('stores new prompts under the authenticated user', async () => {
    prismaMock.prompt.create.mockResolvedValue({
      id: 'prompt-created',
      rawInput: 'raw',
      optimizedText: 'optimized',
      taskType: 'GENERAL',
      tone: 'PROFESSIONAL',
      format: 'STRUCTURED',
      targetLlm: 'CLAUDE',
      tags: [],
      isPublic: false,
      createdAt: new Date('2026-03-22T00:00:00.000Z'),
      updatedAt: new Date('2026-03-22T00:00:00.000Z'),
    })

    const response = await POST(
      new Request('http://localhost:3003/api/prompts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          rawInput: 'raw',
          optimizedText: 'optimized',
          taskType: 'GENERAL',
          tone: 'PROFESSIONAL',
          format: 'STRUCTURED',
          targetLlm: 'CLAUDE',
          tags: [],
          isPublic: false,
        }),
      })
    )

    expect(response.status).toBe(201)
    expect(prismaMock.prompt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-a',
          rawInput: 'raw',
        }),
      })
    )
  })

  it('returns 401 when the user is not authenticated', async () => {
    authState.nextError = new authState.UnauthorizedError('Unauthorized')

    const response = await GET(new Request('http://localhost:3003/api/prompts'))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })
})
