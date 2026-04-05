/**
 * PORTAL Sentra — Environment Variables Export API
 * GET /api/vault/projects/:id/env/export - Export env vars
 */

import { type NextRequest, NextResponse } from 'next/server'
import { envVaultManager } from '@/lib/env-vault-manager'
import type { ApiResponse } from '@/types'

// ============================================================================
// Route Parameters
// ============================================================================

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// GET /api/vault/projects/:id/env/export
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ content: string; filename: string }>>> {
  try {
    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)

    // Check if vault is unlocked (for encrypted values)
    const decryptValues = searchParams.get('decrypt') === 'true'
    if (decryptValues && !envVaultManager.isUnlocked()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vault is locked',
          message: 'Please unlock the vault to export decrypted values',
        },
        { status: 403 }
      )
    }

    const format = (searchParams.get('format') as 'json' | 'env') || 'env'

    const content = envVaultManager.exportVariables('project', projectId, {
      decryptValues,
      format,
    })

    const filename = `env-${projectId}.${format}`

    return NextResponse.json({
      success: true,
      data: {
        content,
        filename,
      },
    })
  } catch (error) {
    console.error('[API] Failed to export env variables:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export environment variables',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
