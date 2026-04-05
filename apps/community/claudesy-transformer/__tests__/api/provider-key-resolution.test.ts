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

const providerKeyState = vi.hoisted(() => {
  class MissingProviderApiKeyError extends Error {
    provider: string

    constructor(provider: string) {
      super(`No API key configured for ${provider}`)
      this.name = 'MissingProviderApiKeyError'
      this.provider = provider
    }
  }

  return {
    resolveProviderApiKey: vi.fn(),
    MissingProviderApiKeyError,
  }
})

const billingGuardMock = vi.hoisted(() => ({
  getUserTier: vi.fn(),
  checkAndTrackUsage: vi.fn(),
  checkModelAccess: vi.fn(),
}))

const optimizerMock = vi.hoisted(() => ({
  optimizePrompt: vi.fn(),
}))

const evaluatorMock = vi.hoisted(() => ({
  evaluatePrompt: vi.fn(),
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

vi.mock('@/lib/llm/user-api-keys', () => ({
  resolveProviderApiKey: providerKeyState.resolveProviderApiKey,
  MissingProviderApiKeyError: providerKeyState.MissingProviderApiKeyError,
}))

vi.mock('@/lib/billing/guard', () => billingGuardMock)
vi.mock('@/lib/optimizer/engine', () => optimizerMock)
vi.mock('@/lib/evaluator/engine', () => evaluatorMock)
vi.mock('@/lib/logger', () => loggerMock)

import { POST as evaluatePOST } from '@/app/api/evaluate/route'
import { POST as optimizePOST } from '@/app/api/optimize/route'

describe('provider key resolution in optimize/evaluate routes', () => {
  beforeEach(() => {
    authState.currentUser = { id: 'user-a' }
    authState.nextError = null
    providerKeyState.resolveProviderApiKey.mockReset()
    billingGuardMock.getUserTier.mockReset()
    billingGuardMock.checkAndTrackUsage.mockReset()
    billingGuardMock.checkModelAccess.mockReset()
    optimizerMock.optimizePrompt.mockReset()
    evaluatorMock.evaluatePrompt.mockReset()
    loggerMock.logger.error.mockReset()

    billingGuardMock.getUserTier.mockResolvedValue('PRO')
    billingGuardMock.checkAndTrackUsage.mockResolvedValue({
      allowed: true,
      used: 1,
      limit: 100,
    })
    billingGuardMock.checkModelAccess.mockReturnValue(true)
  })

  it('uses the server-resolved provider key for optimize requests', async () => {
    providerKeyState.resolveProviderApiKey.mockResolvedValue('server-secret')
    optimizerMock.optimizePrompt.mockResolvedValue({
      superPrompt: {
        role: 'role',
        task: 'task',
        context: 'context',
        chainOfThought: 'cot',
        constraints: [],
        formatSpec: 'format',
        fullPrompt: 'full prompt',
      },
      metadata: {
        provider: 'OPENAI',
        model: 'gpt-4o-mini',
        taskType: 'GENERAL',
        tone: 'PROFESSIONAL',
        format: 'STRUCTURED',
        latencyMs: 12,
      },
    })

    const response = await optimizePOST(
      new Request('http://localhost:3003/api/optimize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          rawIdea: 'Write release notes',
          taskType: 'GENERAL',
          tone: 'PROFESSIONAL',
          format: 'STRUCTURED',
          targetLlm: 'OPENAI',
          provider: 'OPENAI',
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(providerKeyState.resolveProviderApiKey).toHaveBeenCalledWith(
      'user-a',
      'OPENAI'
    )
    expect(optimizerMock.optimizePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'OPENAI',
        apiKey: 'server-secret',
      })
    )
  })

  it('returns a user-facing 400 when the provider key is missing', async () => {
    providerKeyState.resolveProviderApiKey.mockRejectedValue(
      new providerKeyState.MissingProviderApiKeyError('GROK')
    )

    const response = await evaluatePOST(
      new Request('http://localhost:3003/api/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          promptText: 'Evaluate this prompt',
          provider: 'GROK',
        }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      error: 'No API key configured for GROK. Go to Settings to add one.',
      code: 'MISSING_PROVIDER_KEY',
    })
    expect(evaluatorMock.evaluatePrompt).not.toHaveBeenCalled()
  })

  it('uses the server-resolved provider key for evaluate requests', async () => {
    providerKeyState.resolveProviderApiKey.mockResolvedValue('server-secret')
    evaluatorMock.evaluatePrompt.mockResolvedValue({
      overallScore: 8,
      dimensions: [],
      suggestions: [],
      metadata: {
        provider: 'CLAUDE',
        model: 'claude-3-5-sonnet',
        latencyMs: 24,
      },
    })

    const response = await evaluatePOST(
      new Request('http://localhost:3003/api/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          promptText: 'Evaluate this prompt',
          provider: 'CLAUDE',
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(providerKeyState.resolveProviderApiKey).toHaveBeenCalledWith(
      'user-a',
      'CLAUDE'
    )
    expect(evaluatorMock.evaluatePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'CLAUDE',
        apiKey: 'server-secret',
      })
    )
  })
})
