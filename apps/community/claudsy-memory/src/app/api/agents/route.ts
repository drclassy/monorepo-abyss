import { NextRequest, NextResponse } from 'next/server'
import { getServerBaseDir, listAgents, validateAgentName } from '@/lib/engine'
import path from 'path'
import fs from 'fs/promises'

export async function GET() {
  try {
    const agents = await listAgents()
    return NextResponse.json({ agents })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { action: 'add' | 'remove'; name: string }
    const { action, name } = body
    const baseDir = getServerBaseDir()

    if (!validateAgentName(name)) {
      return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
    }

    // Resolve and validate path stays within agents dir
    const agentsRoot = path.resolve(/* turbopackIgnore: true */ baseDir, 'agents')
    const agentPath = path.resolve(/* turbopackIgnore: true */ agentsRoot, name)
    if (!agentPath.startsWith(agentsRoot + path.sep) && agentPath !== agentsRoot) {
      return NextResponse.json({ error: 'Path escape detected' }, { status: 400 })
    }

    if (action === 'add') {
      await fs.mkdir(agentPath, { recursive: true })
      return NextResponse.json({ success: true, action: 'add', name })
    }

    if (action === 'remove') {
      try { await fs.rm(agentPath, { recursive: true, force: true }) } catch { /* ok */ }
      return NextResponse.json({ success: true, action: 'remove', name })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
