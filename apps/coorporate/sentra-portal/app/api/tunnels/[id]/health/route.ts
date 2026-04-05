/**
 * PORTAL Sentra — Tunnel Health Check API
 * GET /api/tunnels/:id/health - Check tunnel health
 */

import { type NextRequest, NextResponse } from 'next/server'
import { tunnelManager } from '@/lib/tunnel-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Route Parameters
// ============================================================================

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// GET /api/tunnels/:id/health
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<
  NextResponse<
    ApiResponse<{
      healthy: boolean
      url?: string
      status?: string
      error?: string
    }>
  >
> {
  try {
    const { id } = await params

    // Get tunnel
    const tunnel = tunnelManager.getTunnel(id)
    if (!tunnel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tunnel not found',
        },
        { status: 404 }
      )
    }

    // Check health
    const health = await tunnelManager.checkTunnelHealth(id)

    return NextResponse.json({
      success: true,
      data: {
        healthy: health.ok,
        url: health.url,
        status: tunnel.status,
        error: health.error,
      },
    })
  } catch (error) {
    console.error('[API] Failed to check tunnel health:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check tunnel health',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
