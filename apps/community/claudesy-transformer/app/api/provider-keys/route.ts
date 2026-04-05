import { NextResponse } from 'next/server'

import {
  DeleteProviderKeyRequestSchema,
  ProviderKeyListResponseSchema,
  SaveProviderKeyRequestSchema,
} from '@/types'
import {
  AppUserNotFoundError,
  requireCurrentAppUser,
  UnauthorizedError,
} from '@/lib/auth/require-current-user'
import {
  deleteUserProviderKey,
  listProviderKeyStates,
  upsertUserProviderKey,
} from '@/lib/llm/user-api-keys'
import { logger } from '@/lib/logger'

function buildAuthErrorResponse(error: Error) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (error instanceof AppUserNotFoundError) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return null
}

export async function GET() {
  try {
    const currentUser = await requireCurrentAppUser()
    const providers = await listProviderKeyStates(currentUser.id)

    return NextResponse.json(ProviderKeyListResponseSchema.parse({ providers }))
  } catch (error) {
    const authResponse = error instanceof Error ? buildAuthErrorResponse(error) : null
    if (authResponse) {
      return authResponse
    }

    logger.error({ route: 'provider-keys', method: 'GET' }, error)
    return NextResponse.json(
      { error: 'Failed to load provider configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireCurrentAppUser()
    const body = await request.json()
    const parsed = SaveProviderKeyRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await upsertUserProviderKey(currentUser.id, parsed.data.provider, parsed.data.apiKey)
    const providers = await listProviderKeyStates(currentUser.id)

    return NextResponse.json(ProviderKeyListResponseSchema.parse({ providers }))
  } catch (error) {
    const authResponse = error instanceof Error ? buildAuthErrorResponse(error) : null
    if (authResponse) {
      return authResponse
    }

    logger.error({ route: 'provider-keys', method: 'PUT' }, error)
    return NextResponse.json(
      { error: 'Failed to save provider configuration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await requireCurrentAppUser()
    const body = await request.json()
    const parsed = DeleteProviderKeyRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await deleteUserProviderKey(currentUser.id, parsed.data.provider)
    const providers = await listProviderKeyStates(currentUser.id)

    return NextResponse.json(ProviderKeyListResponseSchema.parse({ providers }))
  } catch (error) {
    const authResponse = error instanceof Error ? buildAuthErrorResponse(error) : null
    if (authResponse) {
      return authResponse
    }

    logger.error({ route: 'provider-keys', method: 'DELETE' }, error)
    return NextResponse.json(
      { error: 'Failed to remove provider configuration' },
      { status: 500 }
    )
  }
}
