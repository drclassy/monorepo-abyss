// Claudesy Transformer Engine V2 — Prompts API (List + Create)
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { AppUserNotFoundError, UnauthorizedError, requireCurrentAppUser } from '@/lib/auth/require-current-user'
import { CreatePromptSchema } from '@/types'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  taskType: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const currentUser = await requireCurrentAppUser()
    const { searchParams } = new URL(request.url)
    const query = ListQuerySchema.parse(Object.fromEntries(searchParams))

    const where: Record<string, unknown> = {
      deletedAt: null,
      userId: currentUser.id,
    }
    if (query.taskType) where.taskType = query.taskType
    if (query.tag) where.tags = { has: query.tag }
    if (query.search) {
      where.OR = [
        { rawInput: { contains: query.search, mode: 'insensitive' } },
        { optimizedText: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
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
      }),
      prisma.prompt.count({ where }),
    ])

    return NextResponse.json({
      prompts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof AppUserNotFoundError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    logger.error({ route: 'prompts.list' }, error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireCurrentAppUser()
    const body = await request.json()
    const parsed = CreatePromptSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid prompt data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const prompt = await prisma.prompt.create({
      data: {
        ...parsed.data,
        userId: currentUser.id,
      },
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

    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof AppUserNotFoundError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    logger.error({ route: 'prompts.create' }, error)
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}
