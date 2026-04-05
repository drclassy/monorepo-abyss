/**
 * PORTAL Sentra — Environment Variables Bulk Import API
 * POST /api/vault/projects/:id/env/import - Bulk import env vars
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { envVaultManager } from '@/lib/env-vault-manager'
import type { ApiResponse } from '@/types'
import type { EnvBulkImportInput } from '@/types/vault'

// ============================================================================
// Route Parameters
// ============================================================================

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// Validation Schema
// ============================================================================

const importSchema = z.object({
  variables: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ),
  encryptAll: z.boolean().default(true),
  overwriteExisting: z.boolean().default(false),
})

// ============================================================================
// POST /api/vault/projects/:id/env/import
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<
  NextResponse<
    ApiResponse<{
      created: number
      updated: number
      errors: string[]
    }>
  >
> {
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
    const validationResult = importSchema.safeParse(body)
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

    const { variables, encryptAll, overwriteExisting } = validationResult.data

    const results = envVaultManager.bulkImport(variables, 'project', projectId, {
      encryptAll,
      overwriteExisting,
    })

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('[API] Failed to import env variables:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import environment variables',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
