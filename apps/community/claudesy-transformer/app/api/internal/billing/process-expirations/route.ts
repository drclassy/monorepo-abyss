import { NextResponse } from 'next/server'

import { processExpiredSubscriptions } from '@/lib/billing/subscription-service'
import { logger } from '@/lib/logger'

function isAuthorized(request: Request): boolean {
  const secret = process.env.SUBSCRIPTION_EXPIRY_CRON_SECRET
  if (!secret) {
    return false
  }

  const bearer = request.headers.get('authorization')
  if (bearer === `Bearer ${secret}`) {
    return true
  }

  return request.headers.get('x-cron-secret') === secret
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const processed = await processExpiredSubscriptions()
    return NextResponse.json({ processed })
  } catch (error) {
    logger.error({ route: '/api/internal/billing/process-expirations' }, error)
    return NextResponse.json(
      { error: 'Subscription expiration processing failed' },
      { status: 500 }
    )
  }
}
