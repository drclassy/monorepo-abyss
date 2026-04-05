/**
 * PORTAL Sentra — Tunnel API Routes
 * GET /api/tunnels - List all tunnels
 * POST /api/tunnels - Create new tunnel
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { tunnelManager } from '@/lib/tunnel-manager'
import type { ApiResponse } from '@/types'
import type { CreateTunnelInput, Tunnel, TunnelListResponse } from '@/types/tunnel'

// ============================================================================
// Validation Schema
// ============================================================================

const createTunnelSchema = z.object({
  name: z.string().optional(),
  subdomain: z.string().optional(),
  localPort: z.number().int().min(1).max(65535),
  localHost: z.string().default('localhost'),
  targetType: z.enum(['service', 'project', 'port']),
  targetId: z.string().optional(),
})

// ============================================================================
// GET /api/tunnels
// ============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TunnelListResponse>>> {
  try {
    const tunnels = tunnelManager.getAllTunnels()
    const activeCount = tunnelManager.getActiveCount()

    return NextResponse.json({
      success: true,
      data: {
        tunnels,
        activeCount,
      },
    })
  } catch (error) {
    console.error('[API] Failed to get tunnels:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get tunnels',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/tunnels
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ tunnel: Tunnel }>>> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createTunnelSchema.safeParse(body)
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

    const input = validationResult.data as CreateTunnelInput

    // Create tunnel
    const tunnel = await tunnelManager.createTunnel(input)

    return NextResponse.json({
      success: true,
      data: { tunnel },
    })
  } catch (error) {
    console.error('[API] Failed to create tunnel:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tunnel',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
