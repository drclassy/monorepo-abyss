/**
 * PORTAL Sentra — Health Check API
 * GET /api/health
 */

import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db'

interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: { status: 'ok' | 'error'; message: string }
  }
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const dbHealth = checkDatabaseHealth()

  const isHealthy = dbHealth.ok

  const response: HealthResponse = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      database: {
        status: dbHealth.ok ? 'ok' : 'error',
        message: dbHealth.message,
      },
    },
  }

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
  })
}
