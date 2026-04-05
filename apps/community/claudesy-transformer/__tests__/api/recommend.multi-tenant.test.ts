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
  $queryRaw: vi.fn(),
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

vi.mock('@/lib/embeddings/generator', () => ({
  generateEmbedding: vi.fn(async () => [0.12, 0.34, 0.56]),
}))

vi.mock('@/lib/logger', () => loggerMock)

import { POST } from '@/app/api/recommend/route'

describe('recommendation isolation', () => {
  beforeEach(() => {
    authState.currentUser = { id: 'user-a' }
    authState.nextError = null
    prismaMock.$queryRaw.mockReset()
    loggerMock.logger.error.mockReset()
  })

  it('uses an owned-only visibility clause when includePublic is false', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      {
        id: 'prompt-1',
        raw_input: 'private prompt',
        optimized_text: 'optimized',
        task_type: 'GENERAL',
        tone: 'PROFESSIONAL',
        format: 'STRUCTURED',
        target_llm: 'CLAUDE',
        tags: ['private'],
        is_public: false,
        created_at: new Date('2026-03-22T00:00:00.000Z'),
        updated_at: new Date('2026-03-22T00:00:00.000Z'),
        similarity: 0.97,
      },
    ])

    const response = await POST(
      new Request('http://localhost:3003/api/recommend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: 'confidential', limit: 5, includePublic: false }),
      })
    )
    const payload = await response.json()
    const [, , visibilityClause] = prismaMock.$queryRaw.mock.calls[0]

    expect(response.status).toBe(200)
    expect(visibilityClause.values).toContain('user-a')
    expect(visibilityClause.strings.join(' ')).toContain('AND user_id = ')
    expect(visibilityClause.strings.join(' ')).not.toContain('is_public = true')
    expect(payload.recommendations).toHaveLength(1)
  })

  it('uses a public-or-owned visibility clause when includePublic is true', async () => {
    prismaMock.$queryRaw.mockResolvedValue([])

    const response = await POST(
      new Request('http://localhost:3003/api/recommend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: 'shareable', limit: 5, includePublic: true }),
      })
    )
    const [, , visibilityClause] = prismaMock.$queryRaw.mock.calls[0]

    expect(response.status).toBe(200)
    expect(visibilityClause.values).toContain('user-a')
    expect(visibilityClause.strings.join(' ')).toContain('user_id = ')
    expect(visibilityClause.strings.join(' ')).toContain('is_public = true')
  })

  it('returns 401 when unauthenticated', async () => {
    authState.nextError = new authState.UnauthorizedError('Unauthorized')

    const response = await POST(
      new Request('http://localhost:3003/api/recommend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: 'test', limit: 5, includePublic: false }),
      })
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })
})
