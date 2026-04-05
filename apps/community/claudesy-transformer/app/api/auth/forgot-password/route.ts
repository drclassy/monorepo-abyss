import { NextResponse } from 'next/server'

import { EmailActionRequestSchema } from '@/types'
import { enforceAuthAbuseProtection } from '@/lib/auth/abuse-protection'
import { logger } from '@/lib/logger'
import { createSupabasePublicClient } from '@/lib/supabase/public'

const FORGOT_PASSWORD_RESPONSE = {
  ok: true,
  message:
    'Jika email terdaftar, kami akan mengirimkan link reset password dalam beberapa menit.',
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: 'Request body tidak valid' }, { status: 400 })
    }

    const parsed = EmailActionRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const abuseCheck = await enforceAuthAbuseProtection(
      request,
      'FORGOT_PASSWORD',
      parsed.data.email
    )

    if (!abuseCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak permintaan reset password. Coba lagi beberapa saat lagi.',
          code: 'RATE_LIMIT',
        },
        {
          status: 429,
          headers: abuseCheck.retryAfterSeconds
            ? { 'Retry-After': String(abuseCheck.retryAfterSeconds) }
            : undefined,
        }
      )
    }

    const { origin } = new URL(request.url)
    const supabase = createSupabasePublicClient()
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/reset-password`,
    })

    if (error) {
      logger.warn(
        { route: '/api/auth/forgot-password' },
        'Supabase reset password request was not delivered'
      )
    }

    return NextResponse.json(FORGOT_PASSWORD_RESPONSE)
  } catch (error) {
    logger.error({ route: '/api/auth/forgot-password' }, error)
    return NextResponse.json(FORGOT_PASSWORD_RESPONSE)
  }
}
