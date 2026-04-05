import { NextRequest, NextResponse } from 'next/server'
import { validateAgentName } from '@/lib/engine'

// POST /api/facts — create a new fact (scaffold)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      agent?: unknown
      fact?: unknown
      category?: unknown
      status?: unknown
      tags?: unknown
    }

    const agent = typeof body.agent === 'string' ? body.agent : 'claude-code'

    if (!validateAgentName(agent)) {
      return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
    }

    const fact     = typeof body.fact     === 'string' ? body.fact.trim()     : ''
    const category = typeof body.category === 'string' ? body.category        : 'semantic'
    const status   = typeof body.status   === 'string' ? body.status          : 'active'
    const tags     = Array.isArray(body.tags)
      ? body.tags.filter((t): t is string => typeof t === 'string')
      : []

    if (!fact) {
      return NextResponse.json({ error: 'fact content is required' }, { status: 400 })
    }

    const validCategories = ['semantic', 'episodic', 'procedural', 'preference']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Scaffold: fact creation via Python engine CLI is not yet wired.
    // Return a stub success response so the UI can confirm the intent.
    const stubId = Math.random().toString(36).slice(2, 10)
    return NextResponse.json({
      success: true,
      stub: true,
      message: 'Fact creation scaffolded — Python engine write-back not yet wired.',
      fact: {
        id: stubId,
        fact,
        category,
        status,
        tags,
        agent,
        created: new Date().toISOString(),
      },
    }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
