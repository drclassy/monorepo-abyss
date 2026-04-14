// Claudesy's vision, brought to life.
import 'server-only'

import { type NextRequest, NextResponse } from 'next/server'
import { handleCorsPreflight, jsonWithCors } from '@/lib/server/api-cors'
import { isCrewAuthorizedRequest } from '@/lib/server/crew-access-auth'
import { getTransferStatus } from '../run/route'

const CORS_METHODS = ['GET', 'OPTIONS'] as const

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request, CORS_METHODS)
}

export async function GET(req: NextRequest) {
  if (!isCrewAuthorizedRequest(req)) {
    return jsonWithCors(req, CORS_METHODS, { error: 'Unauthorized' }, { status: 401 })
  }

  const transferId = req.nextUrl.searchParams.get('transferId')
  if (!transferId) {
    return jsonWithCors(req, CORS_METHODS, { error: 'transferId diperlukan' }, { status: 400 })
  }

  const status = getTransferStatus(transferId)
  if (!status) {
    return jsonWithCors(req, CORS_METHODS, { error: 'Transfer tidak ditemukan' }, { status: 404 })
  }

  return jsonWithCors(req, CORS_METHODS, { transferId, ...status })
}
