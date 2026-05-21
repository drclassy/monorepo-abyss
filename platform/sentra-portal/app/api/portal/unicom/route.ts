import { NextResponse } from 'next/server'

import { loadUnicomPayload } from '@/lib/portal/data/unicom'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await loadUnicomPayload())
}
