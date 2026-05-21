import { NextResponse } from 'next/server'

import { readVerifyStatus } from '@/lib/portal/clients/verify-cache'
import { runPortalVerify } from '@/lib/portal/clients/verify-runner'
import type { PortalResponse, VerifyStatusFile } from '@/lib/portal/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function GET() {
  const cached = await readVerifyStatus()
  const fetchedAt = new Date().toISOString()
  return NextResponse.json({
    ok: true,
    data: cached,
    fetchedAt,
  } satisfies PortalResponse<VerifyStatusFile | null>)
}

export async function POST() {
  const fetchedAt = new Date().toISOString()
  const file = await runPortalVerify()
  return NextResponse.json({
    ok: true,
    data: file,
    fetchedAt,
  } satisfies PortalResponse<VerifyStatusFile>)
}
