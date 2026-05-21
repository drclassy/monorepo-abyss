import { NextResponse } from 'next/server'

import { loadPromptPayload } from '@/lib/portal/data/prompt'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await loadPromptPayload())
}
