/**
 * PORTAL Sentra — Tunnel Validation API
 * POST /api/tunnels/validate - Validate tunnel configuration
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { tunnelManager } from '@/lib/tunnel-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const validateSchema = z.object({
  subdomain: z.string().optional(),
  localPort: z.number().int().min(1).max(65535),
  localHost: z.string().default('localhost'),
})

// ============================================================================
// POST /api/tunnels/validate
// ============================================================================

export async function POST(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      valid: boolean
      portAvailable?: boolean
      subdomainValid?: boolean
      errors: string[]
    }>
  >
> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = validateSchema.safeParse(body)
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

    const { subdomain, localPort, localHost } = validationResult.data
    const errors: string[] = []

    // Validate subdomain
    let subdomainValid = true
    if (subdomain) {
      const subdomainValidation = tunnelManager.validateSubdomain(subdomain)
      subdomainValid = subdomainValidation.valid
      if (!subdomainValidation.valid && subdomainValidation.error) {
        errors.push(subdomainValidation.error)
      }
    }

    // Check port availability
    const portCheck = await tunnelManager.checkPortAvailability(localPort, localHost)
    if (!portCheck.available && portCheck.error) {
      errors.push(portCheck.error)
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: errors.length === 0,
        portAvailable: portCheck.available,
        subdomainValid,
        errors,
      },
    })
  } catch (error) {
    console.error('[API] Failed to validate tunnel:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate tunnel',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
