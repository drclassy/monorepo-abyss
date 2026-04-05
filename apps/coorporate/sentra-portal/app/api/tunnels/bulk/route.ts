/**
 * PORTAL Sentra — Tunnel Bulk Operations API
 * POST /api/tunnels/bulk - Bulk start/stop/delete tunnels
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { tunnelManager } from '@/lib/tunnel-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const bulkOperationSchema = z.object({
  action: z.enum(['start', 'stop', 'delete']),
  tunnelIds: z.array(z.string()).min(1),
})

// ============================================================================
// POST /api/tunnels/bulk
// ============================================================================

export async function POST(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      results: Array<{
        id: string
        success: boolean
        error?: string
      }>
      successCount: number
      failureCount: number
    }>
  >
> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = bulkOperationSchema.safeParse(body)
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

    const { action, tunnelIds } = validationResult.data
    const results: Array<{ id: string; success: boolean; error?: string }> = []

    for (const id of tunnelIds) {
      try {
        const tunnel = tunnelManager.getTunnel(id)
        if (!tunnel) {
          results.push({ id, success: false, error: 'Tunnel not found' })
          continue
        }

        switch (action) {
          case 'start':
            await tunnelManager.startTunnel(id, tunnel.subdomain)
            break
          case 'stop':
            await tunnelManager.stopTunnel(id)
            break
          case 'delete':
            await tunnelManager.deleteTunnel(id)
            break
        }

        results.push({ id, success: true })
      } catch (error) {
        results.push({
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: true,
      data: {
        results,
        successCount,
        failureCount,
      },
    })
  } catch (error) {
    console.error('[API] Failed to perform bulk operation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk operation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
