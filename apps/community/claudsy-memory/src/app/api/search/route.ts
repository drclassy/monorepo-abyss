import { NextRequest, NextResponse } from 'next/server'
import { listRecentFacts, searchFacts, validateAgentName } from '@/lib/engine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      mode?: 'search' | 'recent'
      query?: string
      agent: string
      category?: string
      status?: string
      page?: number
      pageSize?: number
    }

    const mode = body.mode === 'recent' ? 'recent' : 'search'
    const query = body.query ?? ''
    const agent = body.agent
    const category = body.category?.trim() || undefined
    const status = body.status?.trim() || undefined
    const page = Math.max(1, body.page ?? 1)
    const pageSize = Math.min(50, Math.max(1, body.pageSize ?? 10))
    const offset = (page - 1) * pageSize

    if (mode === 'search' && !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (!validateAgentName(agent)) {
      return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
    }

    const limit = pageSize + 1
    const response = mode === 'recent'
      ? await listRecentFacts(agent, { category, status, limit, offset })
      : await searchFacts(agent, query.trim(), { category, status, limit, offset })

    const hasNext = response.results.length > pageSize
    const results = hasNext ? response.results.slice(0, pageSize) : response.results
    return NextResponse.json({
      mode,
      results,
      raw: response.raw,
      query,
      page,
      pageSize,
      hasNext,
      hasPrev: page > 1,
      category: category ?? '',
      status: status ?? '',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
