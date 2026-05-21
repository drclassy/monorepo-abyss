import { NextResponse } from 'next/server'

import { loadContextPayload } from '@/lib/portal/data/context'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await loadContextPayload())
}
