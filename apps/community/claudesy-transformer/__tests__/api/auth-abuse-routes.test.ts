import { beforeEach, describe, expect, it, vi } from 'vitest'

const abuseProtectionMock = vi.hoisted(() => ({
  enforceAuthAbuseProtection: vi.fn(),
}))

const loggerMock = vi.hoisted(() => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

const supabaseState = vi.hoisted(() => ({
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  resend: vi.fn(),
}))

vi.mock('@/lib/auth/abuse-protection', () => abuseProtectionMock)
vi.mock('@/lib/logger', () => loggerMock)
vi.mock('@/lib/supabase/public', () => ({
  createSupabasePublicClient: vi.fn(() => ({
    auth: {
      signUp: supabaseState.signUp,
      resetPasswordForEmail: supabaseState.resetPasswordForEmail,
      resend: supabaseState.resend,
    },
  })),
}))

import { POST as forgotPasswordPOST } from '@/app/api/auth/forgot-password/route'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { POST as resendVerificationPOST } from '@/app/api/auth/resend-verification/route'

describe('auth abuse protected routes', () => {
  beforeEach(() => {
    abuseProtectionMock.enforceAuthAbuseProtection.mockReset()
    loggerMock.logger.error.mockReset()
    loggerMock.logger.warn.mockReset()
    supabaseState.signUp.mockReset()
    supabaseState.resetPasswordForEmail.mockReset()
    supabaseState.resend.mockReset()

    abuseProtectionMock.enforceAuthAbuseProtection.mockReturnValue({ allowed: true })
    supabaseState.signUp.mockResolvedValue({ error: null })
    supabaseState.resetPasswordForEmail.mockResolvedValue({ error: null })
    supabaseState.resend.mockResolvedValue({ error: null })
  })

  it('returns 429 when register abuse protection blocks the request', async () => {
    abuseProtectionMock.enforceAuthAbuseProtection.mockReturnValue({
      allowed: false,
      retryAfterSeconds: 120,
    })

    const response = await registerPOST(
      new Request('http://localhost:3003/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'User',
          email: 'user@example.com',
          password: 'hunter22',
        }),
      })
    )

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('120')
    expect(await response.json()).toEqual({
      error: 'Terlalu banyak percobaan pendaftaran. Coba lagi beberapa saat lagi.',
      code: 'RATE_LIMIT',
    })
  })

  it('keeps register response generic when supabase reports an existing account', async () => {
    supabaseState.signUp.mockResolvedValue({
      error: { message: 'User already registered' },
    })

    const response = await registerPOST(
      new Request('http://localhost:3003/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'User',
          email: 'user@example.com',
          password: 'hunter22',
        }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      message:
        'Jika email dapat digunakan, kami akan mengirimkan link verifikasi untuk melanjutkan pendaftaran.',
    })
  })

  it('returns the generic forgot-password success payload even when provider delivery fails', async () => {
    supabaseState.resetPasswordForEmail.mockResolvedValue({
      error: { message: 'rate limit from provider' },
    })

    const response = await forgotPasswordPOST(
      new Request('http://localhost:3003/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      ok: true,
      message:
        'Jika email terdaftar, kami akan mengirimkan link reset password dalam beberapa menit.',
    })
    expect(loggerMock.logger.warn).toHaveBeenCalled()
  })

  it('returns 429 when verification resend abuse protection blocks the request', async () => {
    abuseProtectionMock.enforceAuthAbuseProtection.mockReturnValue({
      allowed: false,
      retryAfterSeconds: 45,
    })

    const response = await resendVerificationPOST(
      new Request('http://localhost:3003/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      })
    )

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('45')
    expect(await response.json()).toEqual({
      error: 'Terlalu banyak permintaan verifikasi. Coba lagi beberapa saat lagi.',
      code: 'RATE_LIMIT',
    })
  })

  it('keeps resend response generic when provider delivery fails', async () => {
    supabaseState.resend.mockResolvedValue({
      error: { message: 'user not found' },
    })

    const response = await resendVerificationPOST(
      new Request('http://localhost:3003/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      ok: true,
      message:
        'Jika akun menunggu verifikasi, kami akan mengirim ulang email verifikasi dalam beberapa menit.',
    })
    expect(loggerMock.logger.warn).toHaveBeenCalled()
  })
})
