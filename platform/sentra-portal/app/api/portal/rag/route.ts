import { NextResponse } from 'next/server'

import { loadRagPayload } from '@/lib/portal/data/rag'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await loadRagPayload())
}
