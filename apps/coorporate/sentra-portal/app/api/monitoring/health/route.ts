/**
 * PORTAL Sentra — Health Check API
 * GET /api/monitoring/health - Comprehensive health status
 */

import { type NextRequest, NextResponse } from 'next/server'
import { healthMonitor } from '@/lib/monitoring/health-monitor'
import type { ApiResponse } from '@/types'

/**
 * GET /api/monitoring/health
 * Returns comprehensive health status of all services
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    const healthStatus = await healthMonitor.performHealthCheck()

    // Map overall for UI compatibility: "error" -> "critical", "warning" -> "degraded"
    const overall: 'healthy' | 'degraded' | 'critical' =
      healthStatus.overall === 'error'
        ? 'critical'
        : healthStatus.overall === 'warning'
          ? 'degraded'
          : 'healthy'

    const services = detailed
      ? healthStatus.services
      : (Object.fromEntries(
          Object.entries(healthStatus.services).map(([key, service]) => [
            key,
            {
              status: service.status,
              message: service.message,
              latency: service.latency,
            },
          ])
        ) as typeof healthStatus.services)

    return NextResponse.json({
      success: true,
      data: {
        overall,
        timestamp: healthStatus.timestamp,
        services,
        uptime: healthStatus.uptime,
        version: healthStatus.version,
      },
    })
  } catch (error) {
    console.error('[API] Health check failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/monitoring/health/check
 * Trigger manual health check
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const healthStatus = await healthMonitor.performHealthCheck()

    const overall: 'healthy' | 'degraded' | 'critical' =
      healthStatus.overall === 'error'
        ? 'critical'
        : healthStatus.overall === 'warning'
          ? 'degraded'
          : 'healthy'

    return NextResponse.json({
      success: true,
      data: {
        triggered: true,
        health: {
          ...healthStatus,
          overall,
        },
      },
    })
  } catch (error) {
    console.error('[API] Manual health check failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Manual health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
