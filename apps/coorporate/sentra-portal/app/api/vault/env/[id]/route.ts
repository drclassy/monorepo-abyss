/**
 * PORTAL Sentra — Environment Variable Individual API
 * PATCH /api/vault/env/:id - Update env var
 * DELETE /api/vault/env/:id - Delete env var
 * GET /api/vault/env/:id - Get env var with decrypted value
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { envVaultManager } from '@/lib/env-vault-manager'
import type { ApiResponse } from '@/types'
import type { EnvVariable, EnvVariableDisplay } from '@/types/vault'

// ============================================================================
// Route Parameters
// ============================================================================

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// Validation Schema
// ============================================================================

const updateEnvSchema = z.object({
  value: z.string().optional(),
  description: z.string().optional(),
})

// ============================================================================
// GET /api/vault/env/:id
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ variable: EnvVariableDisplay }>>> {
  try {
    const { id } = await params

    // Check if vault is unlocked
    if (!envVaultManager.isUnlocked()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vault is locked',
          message: 'Please unlock the vault first',
        },
        { status: 403 }
      )
    }

    const variable = envVaultManager.getVariable(id)
    if (!variable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Variable not found',
        },
        { status: 404 }
      )
    }

    // Decrypt value for display
    let displayValue: string
    try {
      displayValue = envVaultManager.decryptValue(variable)
    } catch {
      displayValue = '***DECRYPTION_FAILED***'
    }

    const displayVariable: EnvVariableDisplay = {
      id: variable.id,
      key: variable.key,
      value: displayValue,
      isEncrypted: variable.isEncrypted,
      isRevealed: true,
      scope: variable.scope,
      description: variable.description,
      createdAt: variable.createdAt,
      updatedAt: variable.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: { variable: displayVariable },
    })
  } catch (error) {
    console.error('[API] Failed to get env variable:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get environment variable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/vault/env/:id
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ variable: EnvVariable }>>> {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if vault is unlocked
    if (!envVaultManager.isUnlocked()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vault is locked',
          message: 'Please unlock the vault first',
        },
        { status: 403 }
      )
    }

    // Validate input
    const validationResult = updateEnvSchema.safeParse(body)
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

    const input = validationResult.data

    // Update variable
    const variable = envVaultManager.updateVariable(id, input)

    return NextResponse.json({
      success: true,
      data: { variable },
    })
  } catch (error) {
    console.error('[API] Failed to update env variable:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update environment variable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/vault/env/:id
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id } = await params

    // Check if vault is unlocked (not strictly needed for delete, but good for consistency)
    if (!envVaultManager.isUnlocked()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vault is locked',
          message: 'Please unlock the vault first',
        },
        { status: 403 }
      )
    }

    envVaultManager.deleteVariable(id)

    return NextResponse.json({
      success: true,
      data: undefined,
    })
  } catch (error) {
    console.error('[API] Failed to delete env variable:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete environment variable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
