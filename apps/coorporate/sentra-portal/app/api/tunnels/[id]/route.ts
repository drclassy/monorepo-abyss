/**
 * PORTAL Sentra — Tunnel Individual API Routes
 * DELETE /api/tunnels/:id - Delete tunnel
 * PATCH /api/tunnels/:id - Update tunnel (start/stop)
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { tunnelManager } from '@/lib/tunnel-manager'
import type { ApiResponse } from '@/types'
import type { Tunnel } from '@/types/tunnel'

// ============================================================================
// Route Parameters
// ============================================================================

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// PATCH /api/tunnels/:id
// ============================================================================

const updateTunnelSchema = z.object({
  action: z.enum(['start', 'stop']),
})

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ tunnel: Tunnel }>>> {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validationResult = updateTunnelSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: validationResult.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    const { action } = validationResult.data

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

    // Perform action
    if (action === 'start') {
      await tunnelManager.startTunnel(id)
    } else if (action === 'stop') {
      await tunnelManager.stopTunnel(id)
    }

    // Get updated tunnel
    const updatedTunnel = tunnelManager.getTunnel(id)

    return NextResponse.json({
      success: true,
      data: { tunnel: updatedTunnel! },
    })
  } catch (error) {
    console.error('[API] Failed to update tunnel:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tunnel',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/tunnels/:id
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id } = await params

    // Check if tunnel exists
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

    // Delete tunnel
    await tunnelManager.deleteTunnel(id)

    return NextResponse.json({
      success: true,
      data: undefined,
    })
  } catch (error) {
    console.error('[API] Failed to delete tunnel:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete tunnel',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
