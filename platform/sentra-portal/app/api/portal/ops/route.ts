import { NextResponse } from 'next/server'

import { loadOpsPayload } from '@/lib/portal/data/ops'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await loadOpsPayload()
  return NextResponse.json(payload)
}
