import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => {
  class UnauthorizedError extends Error {}
  class AppUserNotFoundError extends Error {}

  return {
    currentUser: { id: 'user-b' },
    nextError: null as Error | null,
    UnauthorizedError,
    AppUserNotFoundError,
  }
})

const prismaMock = vi.hoisted(() => ({
  prompt: {
    findFirst: vi.fn(),
    update: vi.fn(),
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

import { DELETE, GET, PUT } from '@/app/api/prompts/[id]/route'

describe('prompt detail routes prevent IDOR', () => {
  beforeEach(() => {
    authState.currentUser = { id: 'user-b' }
    authState.nextError = null
    prismaMock.prompt.findFirst.mockReset()
    prismaMock.prompt.update.mockReset()
    loggerMock.logger.error.mockReset()
  })

  it('returns 404 when another user prompt is requested', async () => {
    prismaMock.prompt.findFirst.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost:3003/api/prompts/prompt-a'), {
      params: Promise.resolve({ id: 'prompt-a' }),
    })

    expect(response.status).toBe(404)
    expect(prismaMock.prompt.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prompt-a', userId: 'user-b', deletedAt: null },
      })
    )
  })

  it('blocks cross-user updates', async () => {
    prismaMock.prompt.findFirst.mockResolvedValue(null)

    const response = await PUT(
      new Request('http://localhost:3003/api/prompts/prompt-a', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          rawInput: 'tampered',
          optimizedText: 'tampered',
          taskType: 'GENERAL',
          tone: 'PROFESSIONAL',
          format: 'STRUCTURED',
          targetLlm: 'CLAUDE',
          tags: [],
          isPublic: false,
        }),
      }),
      {
        params: Promise.resolve({ id: 'prompt-a' }),
      }
    )

    expect(response.status).toBe(404)
    expect(prismaMock.prompt.update).not.toHaveBeenCalled()
  })

  it('blocks cross-user deletes', async () => {
    prismaMock.prompt.findFirst.mockResolvedValue(null)

    const response = await DELETE(new Request('http://localhost:3003/api/prompts/prompt-a'), {
      params: Promise.resolve({ id: 'prompt-a' }),
    })

    expect(response.status).toBe(404)
    expect(prismaMock.prompt.update).not.toHaveBeenCalled()
  })
})
