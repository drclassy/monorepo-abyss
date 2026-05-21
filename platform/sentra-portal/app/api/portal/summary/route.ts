import { NextResponse } from 'next/server'

import { loadStripSummary } from '@/lib/portal/aggregate/summary'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await loadStripSummary()
  return NextResponse.json(payload)
}
