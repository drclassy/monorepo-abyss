// Claudesy Transformer Engine V2 — Recommend API
import { NextResponse } from 'next/server'

import { AppUserNotFoundError, UnauthorizedError, requireCurrentAppUser } from '@/lib/auth/require-current-user'
import { RecommendRequestSchema } from '@/types'
import { findSimilarPrompts } from '@/lib/embeddings/similarity'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const currentUser = await requireCurrentAppUser()
    const body = await request.json()
    const parsed = RecommendRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const recommendations = await findSimilarPrompts(
      parsed.data.text,
      currentUser.id,
      parsed.data.limit,
      parsed.data.includePublic
    )

    return NextResponse.json({ recommendations })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof AppUserNotFoundError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const message = error instanceof Error ? error.message : 'Internal server error'
    logger.error({ route: 'recommend' }, error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
