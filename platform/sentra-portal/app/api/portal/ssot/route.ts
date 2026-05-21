import { NextResponse } from 'next/server'

import { loadSsotPayload } from '@/lib/portal/data/ssot'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await loadSsotPayload()
  return NextResponse.json(payload)
}
