/**
 * PORTAL Sentra — Alerts API
 * GET /api/alerts - Get alerts summary and list
 * POST /api/alerts/evaluate - Manually trigger alert evaluation
 */

import { type NextRequest, NextResponse } from 'next/server'
import { alertManager } from '@/lib/alerts/alert-manager'
import type { ApiResponse } from '@/types'

/**
 * GET /api/alerts
 * Get alerts summary and active alerts
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('history') === 'true'
    const limit = Number.parseInt(searchParams.get('limit') || '50')

    const summary = await alertManager.getAlertSummary()
    const activeAlerts = alertManager.getActiveAlerts()

    const response = {
      summary,
      activeAlerts: activeAlerts.slice(0, limit),
      ...(includeHistory && { allAlerts: summary.recent }),
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('[API] Failed to get alerts:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alerts/evaluate
 * Manually trigger alert evaluation with current metrics
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ triggered: any[]; total: number }>>> {
  try {
    // In a real implementation, you'd fetch current metrics from monitoring sources
    // For now, we'll use mock metrics for demonstration
    const mockMetrics = {
      cpu: { usage: 75 },
      memory: { usage: 80 },
      errorRate: 3.2,
      uptime: 97,
      services: [
        { name: 'primary-healthcare', health: 'healthy' },
        { name: 'sentra-portal', health: 'healthy' },
        { name: 'academic-solutions', health: 'unhealthy' },
      ],
    }

    const triggeredAlerts = await alertManager.evaluateMetrics(mockMetrics)

    return NextResponse.json({
      success: true,
      data: {
        triggered: triggeredAlerts,
        total: triggeredAlerts.length,
      },
    })
  } catch (error) {
    console.error('[API] Failed to evaluate alerts:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to evaluate alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
