/**
 * PORTAL Sentra — Vault Unlock/Initialize API
 * POST /api/vault/unlock - Unlock or initialize the vault
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { envVaultManager } from '@/lib/env-vault-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Validation Schema
// ============================================================================

const unlockSchema = z.object({
  masterPassword: z.string().min(8, 'Master password must be at least 8 characters'),
  initialize: z.boolean().default(false),
})

// ============================================================================
// POST /api/vault/unlock
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ unlocked: boolean; initialized: boolean }>>> {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = unlockSchema.safeParse(body)
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

    const { masterPassword, initialize } = validationResult.data

    // Check if vault is initialized
    const isInitialized = envVaultManager.isVaultInitialized()

    if (!isInitialized) {
      if (!initialize) {
        return NextResponse.json(
          {
            success: false,
            error: 'Vault not initialized',
            message: 'Vault needs to be initialized first',
          },
          { status: 400 }
        )
      }

      // Initialize vault
      envVaultManager.initializeVault(masterPassword)

      return NextResponse.json({
        success: true,
        data: {
          unlocked: true,
          initialized: true,
        },
      })
    }

    // Unlock existing vault
    const unlocked = envVaultManager.unlockVault(masterPassword)

    if (!unlocked) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid master password',
          message: 'The master password is incorrect',
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        unlocked: true,
        initialized: true,
      },
    })
  } catch (error) {
    console.error('[API] Failed to unlock vault:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unlock vault',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
