/**
 * PORTAL Sentra — Alert Acknowledgment API
 * POST /api/alerts/{id}/acknowledge - Acknowledge an alert
 */

import { type NextRequest, NextResponse } from 'next/server'
import { alertManager } from '@/lib/alerts/alert-manager'
import type { ApiResponse } from '@/types'

/**
 * POST /api/alerts/{id}/acknowledge
 * Acknowledge an alert by ID
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ acknowledged: boolean; alertId: string }>>> {
  try {
    const alertId = params.id

    if (!alertId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert ID required',
          message: 'Please provide a valid alert ID',
        },
        { status: 400 }
      )
    }

    // In a real app, you'd get user ID from authentication
    const userId = 'admin' // Mock user ID

    const acknowledged = await alertManager.acknowledgeAlert(alertId, userId)

    if (!acknowledged) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
          message: `No active alert found with ID: ${alertId}`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        acknowledged: true,
        alertId,
      },
    })
  } catch (error) {
    console.error('[API] Failed to acknowledge alert:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to acknowledge alert',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
