/**
 * PORTAL Sentra — Vault Status API
 * GET /api/vault/status - Get vault initialization and lock status
 */

import { NextResponse } from 'next/server'
import { envVaultManager } from '@/lib/env-vault-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// GET /api/vault/status
// ============================================================================

export async function GET(): Promise<
  NextResponse<
    ApiResponse<{
      initialized: boolean
      unlocked: boolean
    }>
  >
> {
  try {
    const initialized = envVaultManager.isVaultInitialized()
    const unlocked = envVaultManager.isUnlocked()

    return NextResponse.json({
      success: true,
      data: {
        initialized,
        unlocked,
      },
    })
  } catch (error) {
    console.error('[API] Failed to get vault status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get vault status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
