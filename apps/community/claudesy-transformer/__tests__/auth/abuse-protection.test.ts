import { beforeEach, describe, expect, it, vi } from 'vitest'

const sharedRateLimitMock = vi.hoisted(() => ({
  consumeSharedRateLimit: vi.fn(),
}))

vi.mock('@/lib/auth/shared-rate-limit', () => sharedRateLimitMock)

import {
  enforceAuthAbuseProtection,
} from '@/lib/auth/abuse-protection'

describe('auth abuse protection', () => {
  beforeEach(() => {
    sharedRateLimitMock.consumeSharedRateLimit.mockReset()
  })

  it('normalizes auth abuse checks into shared infra lookups', async () => {
    sharedRateLimitMock.consumeSharedRateLimit
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 60 })

    const firstRequest = new Request('http://localhost:3003/api/auth/register', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    })

    const blocked = await enforceAuthAbuseProtection(
      firstRequest,
      'REGISTER',
      'USER@example.com '
    )

    expect(sharedRateLimitMock.consumeSharedRateLimit).toHaveBeenNthCalledWith(1, {
      action: 'REGISTER_IP',
      scope: 'IP',
      rawKey: '10.0.0.1',
      rule: { limit: 5, windowMs: 900000 },
    })
    expect(sharedRateLimitMock.consumeSharedRateLimit).toHaveBeenNthCalledWith(2, {
      action: 'REGISTER_EMAIL',
      scope: 'EMAIL',
      rawKey: 'user@example.com',
      rule: { limit: 3, windowMs: 3600000 },
    })
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBe(60)
  })

  it('stops after ip throttling without checking the email bucket', async () => {
    sharedRateLimitMock.consumeSharedRateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 30,
    })

    const request = new Request('http://localhost:3003/api/auth/forgot-password', {
      headers: { 'x-forwarded-for': '10.0.0.2' },
    })

    const result = await enforceAuthAbuseProtection(
      request,
      'FORGOT_PASSWORD',
      'reset@example.com'
    )

    expect(sharedRateLimitMock.consumeSharedRateLimit).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ allowed: false, retryAfterSeconds: 30 })
  })
})
