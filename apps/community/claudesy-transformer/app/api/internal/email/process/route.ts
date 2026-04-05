import { NextResponse } from 'next/server'

import { processEmailQueue } from '@/lib/email/queue'
import { logger } from '@/lib/logger'

function isAuthorized(request: Request): boolean {
  const secret = process.env.EMAIL_QUEUE_CRON_SECRET
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
    const result = await processEmailQueue()
    return NextResponse.json(result)
  } catch (error) {
    logger.error({ route: '/api/internal/email/process' }, error)
    return NextResponse.json(
      { error: 'Email queue processing failed' },
      { status: 500 }
    )
  }
}
