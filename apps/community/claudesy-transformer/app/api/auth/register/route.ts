import { NextResponse } from 'next/server'

import { RegisterRequestSchema } from '@/types'
import { enforceAuthAbuseProtection } from '@/lib/auth/abuse-protection'
import { logger } from '@/lib/logger'
import { createSupabasePublicClient } from '@/lib/supabase/public'

const REGISTER_SUCCESS_MESSAGE =
  'Jika email dapat digunakan, kami akan mengirimkan link verifikasi untuk melanjutkan pendaftaran.'

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: 'Request body tidak valid' }, { status: 400 })
    }

    const parsed = RegisterRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const abuseCheck = await enforceAuthAbuseProtection(
      request,
      'REGISTER',
      parsed.data.email
    )

    if (!abuseCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak percobaan pendaftaran. Coba lagi beberapa saat lagi.',
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
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { name: parsed.data.name },
        emailRedirectTo: `${origin}/api/auth/callback`,
      },
    })

    if (
      error &&
      !error.message.toLowerCase().includes('already registered') &&
      !error.message.toLowerCase().includes('already been registered')
    ) {
      logger.error({ route: '/api/auth/register' }, error)
      return NextResponse.json(
        { error: 'Pendaftaran tidak dapat diproses saat ini. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, message: REGISTER_SUCCESS_MESSAGE })
  } catch (error) {
    logger.error({ route: '/api/auth/register' }, error)
    return NextResponse.json(
      { error: 'Pendaftaran tidak dapat diproses saat ini. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
