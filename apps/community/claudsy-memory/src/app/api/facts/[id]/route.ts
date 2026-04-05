import { NextRequest, NextResponse } from 'next/server'
import { inspectFact, validateAgentName, validateFactId } from '@/lib/engine'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { searchParams } = req.nextUrl
  const agent = searchParams.get('agent') ?? 'claude-code'
  const { id } = await context.params

  if (!validateAgentName(agent)) {
    return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
  }

  if (!validateFactId(id)) {
    return NextResponse.json({ error: 'Invalid fact id' }, { status: 400 })
  }

  try {
    const fact = await inspectFact(agent, id)
    if (!fact) {
      return NextResponse.json({ error: `Fact '${id}' not found` }, { status: 404 })
    }
    return NextResponse.json({ fact, agent, id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/facts/[id] — update fact (scaffold)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { searchParams } = req.nextUrl
  const agent = searchParams.get('agent') ?? 'claude-code'
  const { id } = await context.params

  if (!validateAgentName(agent)) {
    return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
  }

  if (!validateFactId(id)) {
    return NextResponse.json({ error: 'Invalid fact id' }, { status: 400 })
  }

  try {
    const body = await req.json() as Record<string, unknown>
    // Scaffold: update not yet wired to Python engine
    return NextResponse.json({
      success: true,
      stub: true,
      message: 'Fact update scaffolded — Python engine write-back not yet wired.',
      id,
      agent,
      patch: body,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/facts/[id] — soft-delete fact (scaffold)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { searchParams } = req.nextUrl
  const agent = searchParams.get('agent') ?? 'claude-code'
  const { id } = await context.params

  if (!validateAgentName(agent)) {
    return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
  }

  if (!validateFactId(id)) {
    return NextResponse.json({ error: 'Invalid fact id' }, { status: 400 })
  }

  // Scaffold: soft-delete not yet wired to Python engine
  return NextResponse.json({
    success: true,
    stub: true,
    message: 'Fact delete scaffolded — Python engine write-back not yet wired.',
    id,
    agent,
    deletedAt: new Date().toISOString(),
  })
}
