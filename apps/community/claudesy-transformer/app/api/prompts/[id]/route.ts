// Claudesy Transformer Engine V2 — Single Prompt API (GET, PUT, DELETE)
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { AppUserNotFoundError, UnauthorizedError, requireCurrentAppUser } from '@/lib/auth/require-current-user'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { CreatePromptSchema } from '@/types'

const UpdatePromptSchema = CreatePromptSchema.extend({
  tags: z.array(z.string()).default([]),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const currentUser = await requireCurrentAppUser()
    const prompt = await prisma.prompt.findFirst({
      where: { id, userId: currentUser.id, deletedAt: null },
      select: {
        id: true,
        rawInput: true,
        optimizedText: true,
        taskType: true,
        tone: true,
        format: true,
        targetLlm: true,
        tags: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    return NextResponse.json(prompt)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof AppUserNotFoundError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    logger.error({ route: 'prompts.get' }, error)
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const currentUser = await requireCurrentAppUser()
    const body = await request.json()
    const parsed = UpdatePromptSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid prompt data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existingPrompt = await prisma.prompt.findFirst({
      where: { id, userId: currentUser.id, deletedAt: null },
      select: { id: true },
    })

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        rawInput: true,
        optimizedText: true,
        taskType: true,
        tone: true,
        format: true,
        targetLlm: true,
        tags: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(prompt)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof AppUserNotFoundError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    logger.error({ route: 'prompts.update' }, error)
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const currentUser = await requireCurrentAppUser()
    const existingPrompt = await prisma.prompt.findFirst({
      where: { id, userId: currentUser.id, deletedAt: null },
      select: { id: true },
    })

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // Soft delete
    await prisma.prompt.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof AppUserNotFoundError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    logger.error({ route: 'prompts.delete' }, error)
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
  }
}
