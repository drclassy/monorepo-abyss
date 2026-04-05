/**
 * PORTAL Sentra — Project Environment Variables API
 * GET /api/vault/projects/:id/env - Get all env vars for project
 * POST /api/vault/projects/:id/env - Create new env var
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { envVaultManager } from '@/lib/env-vault-manager'
import type { ApiResponse } from '@/types'
import type { EnvVariable, EnvVariableInput } from '@/types/vault'

// ============================================================================
// Route Parameters
// ============================================================================

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// Validation Schema
// ============================================================================

const createEnvSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      'Key must be a valid environment variable name (letters, numbers, underscores, no spaces)'
    ),
  value: z.string(),
  isEncrypted: z.boolean().default(true),
  description: z.string().optional(),
})

// ============================================================================
// GET /api/vault/projects/:id/env
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ variables: EnvVariable[] }>>> {
  try {
    const { id: projectId } = await params

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

    const variables = envVaultManager.getVariables('project', projectId)

    return NextResponse.json({
      success: true,
      data: { variables },
    })
  } catch (error) {
    console.error('[API] Failed to get env variables:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get environment variables',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/vault/projects/:id/env
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ variable: EnvVariable }>>> {
  try {
    const { id: projectId } = await params
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
    const validationResult = createEnvSchema.safeParse(body)
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

    const input = validationResult.data as EnvVariableInput

    // Create variable
    const variable = envVaultManager.createVariable(input, 'project', projectId)

    return NextResponse.json({
      success: true,
      data: { variable },
    })
  } catch (error) {
    console.error('[API] Failed to create env variable:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create environment variable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
