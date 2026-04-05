import { NextRequest, NextResponse } from 'next/server'
import { getServerBaseDir, readDocument, validateAgentName, validateDocumentName, writeDocument } from '@/lib/engine'

function validateParams(agent: string, doc: string) {
  if (!validateAgentName(agent)) return 'Invalid agent name'
  if (!validateDocumentName(doc)) return `Document '${doc}' not allowed`
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const agent = searchParams.get('agent') ?? 'claude-code'
  const doc = searchParams.get('doc') ?? 'MEMORY.md'

  const err = validateParams(agent, doc)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  try {
    const content = await readDocument(agent, doc)
    return NextResponse.json({ content, doc, agent, baseDir: getServerBaseDir() })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Read failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { agent: string; doc: string; content: string }
    const { agent, doc, content } = body

    const err = validateParams(agent, doc)
    if (err) return NextResponse.json({ error: err }, { status: 400 })
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Document content must be a string' }, { status: 400 })
    }

    await writeDocument(agent, doc, content)
    return NextResponse.json({ success: true, doc, agent })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Write failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
