import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  userApiKey: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    findUnique: vi.fn(),
  },
}))

const cryptoMock = vi.hoisted(() => ({
  encrypt: vi.fn(),
  decrypt: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/lib/crypto', () => cryptoMock)

import {
  MissingProviderApiKeyError,
  deleteUserProviderKey,
  listProviderKeyStates,
  resolveProviderApiKey,
  upsertUserProviderKey,
} from '@/lib/llm/user-api-keys'

describe('user api key storage helpers', () => {
  beforeEach(() => {
    prismaMock.userApiKey.findMany.mockReset()
    prismaMock.userApiKey.upsert.mockReset()
    prismaMock.userApiKey.deleteMany.mockReset()
    prismaMock.userApiKey.findUnique.mockReset()
    cryptoMock.encrypt.mockReset()
    cryptoMock.decrypt.mockReset()

    delete process.env.ANTHROPIC_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.MISTRAL_API_KEY
    delete process.env.GOOGLE_AI_API_KEY
    delete process.env.QWEN_API_KEY
    delete process.env.XAI_API_KEY
  })

  it('lists provider states across user, env, local, and empty sources', async () => {
    prismaMock.userApiKey.findMany.mockResolvedValue([{ provider: 'CLAUDE' }])
    process.env.OPENAI_API_KEY = 'env-openai'

    const states = await listProviderKeyStates('user-1')

    expect(states).toEqual(
      expect.arrayContaining([
        { provider: 'CLAUDE', hasKey: true, source: 'USER' },
        { provider: 'OPENAI', hasKey: true, source: 'ENV' },
        { provider: 'LOCAL', hasKey: true, source: 'LOCAL' },
        { provider: 'GROK', hasKey: false, source: 'NONE' },
      ])
    )
  })

  it('encrypts and upserts user provider keys', async () => {
    cryptoMock.encrypt.mockReturnValue({
      encrypted: 'ciphertext',
      iv: 'init-vector',
      authTag: 'auth-tag',
    })

    await upsertUserProviderKey('user-1', 'OPENAI', 'sk-secret')

    expect(cryptoMock.encrypt).toHaveBeenCalledWith('sk-secret')
    expect(prismaMock.userApiKey.upsert).toHaveBeenCalledWith({
      where: {
        userId_provider: {
          userId: 'user-1',
          provider: 'OPENAI',
        },
      },
      create: {
        userId: 'user-1',
        provider: 'OPENAI',
        encryptedKey: 'ciphertext',
        iv: 'init-vector',
        authTag: 'auth-tag',
      },
      update: {
        encryptedKey: 'ciphertext',
        iv: 'init-vector',
        authTag: 'auth-tag',
      },
    })
  })

  it('deletes keys scoped to the current user and provider', async () => {
    await deleteUserProviderKey('user-7', 'GROK')

    expect(prismaMock.userApiKey.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-7',
        provider: 'GROK',
      },
    })
  })

  it('prefers the stored encrypted key over server env fallback', async () => {
    prismaMock.userApiKey.findUnique.mockResolvedValue({
      encryptedKey: 'ciphertext',
      iv: 'init-vector',
      authTag: 'auth-tag',
    })
    cryptoMock.decrypt.mockReturnValue('user-key')
    process.env.OPENAI_API_KEY = 'env-key'

    const result = await resolveProviderApiKey('user-2', 'OPENAI')

    expect(result).toBe('user-key')
    expect(cryptoMock.decrypt).toHaveBeenCalledWith(
      'ciphertext',
      'init-vector',
      'auth-tag'
    )
  })

  it('falls back to server env when the user has no stored key', async () => {
    prismaMock.userApiKey.findUnique.mockResolvedValue(null)
    process.env.GOOGLE_AI_API_KEY = 'env-gemini-key'

    const result = await resolveProviderApiKey('user-3', 'GEMINI')

    expect(result).toBe('env-gemini-key')
  })

  it('throws a typed error when no key exists for a remote provider', async () => {
    prismaMock.userApiKey.findUnique.mockResolvedValue(null)

    await expect(resolveProviderApiKey('user-4', 'QWEN')).rejects.toBeInstanceOf(
      MissingProviderApiKeyError
    )
  })
})
