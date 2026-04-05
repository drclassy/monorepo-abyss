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

const keyStoreMock = vi.hoisted(() => ({
  listProviderKeyStates: vi.fn(),
  upsertUserProviderKey: vi.fn(),
  deleteUserProviderKey: vi.fn(),
}))

const loggerMock = vi.hoisted(() => ({
  logger: {
    error: vi.fn(),
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

vi.mock('@/lib/llm/user-api-keys', () => keyStoreMock)
vi.mock('@/lib/logger', () => loggerMock)

import { DELETE, GET, PUT } from '@/app/api/provider-keys/route'

describe('provider key routes', () => {
  beforeEach(() => {
    authState.currentUser = { id: 'user-a' }
    authState.nextError = null
    keyStoreMock.listProviderKeyStates.mockReset()
    keyStoreMock.upsertUserProviderKey.mockReset()
    keyStoreMock.deleteUserProviderKey.mockReset()
    loggerMock.logger.error.mockReset()
  })

  it('returns the current provider configuration list', async () => {
    keyStoreMock.listProviderKeyStates.mockResolvedValue([
      { provider: 'OPENAI', hasKey: true, source: 'USER' },
      { provider: 'LOCAL', hasKey: true, source: 'LOCAL' },
    ])

    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(keyStoreMock.listProviderKeyStates).toHaveBeenCalledWith('user-a')
    expect(payload.providers).toEqual([
      { provider: 'OPENAI', hasKey: true, source: 'USER' },
      { provider: 'LOCAL', hasKey: true, source: 'LOCAL' },
    ])
  })

  it('stores a key through the authenticated user scope', async () => {
    keyStoreMock.listProviderKeyStates.mockResolvedValue([
      { provider: 'OPENAI', hasKey: true, source: 'USER' },
    ])

    const response = await PUT(
      new Request('http://localhost:3003/api/provider-keys', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'OPENAI',
          apiKey: 'sk-secret',
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(keyStoreMock.upsertUserProviderKey).toHaveBeenCalledWith(
      'user-a',
      'OPENAI',
      'sk-secret'
    )
  })

  it('returns 401 when the current user is not authenticated', async () => {
    authState.nextError = new authState.UnauthorizedError('Unauthorized')

    const response = await GET()

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('removes only the current user key for the chosen provider', async () => {
    keyStoreMock.listProviderKeyStates.mockResolvedValue([
      { provider: 'OPENAI', hasKey: false, source: 'NONE' },
    ])

    const response = await DELETE(
      new Request('http://localhost:3003/api/provider-keys', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'OPENAI',
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(keyStoreMock.deleteUserProviderKey).toHaveBeenCalledWith(
      'user-a',
      'OPENAI'
    )
  })
})
