import { NextRequest, NextResponse } from 'next/server'
import { getHealthState, runCommand, validateAgentName } from '@/lib/engine'

const ALLOWED_COMMANDS = new Set(['run', 'extract', 'consolidate', 'boot', 'health'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      command: string
      agent: string
      extra?: string[]
    }

    const { command, agent, extra = [] } = body

    if (!ALLOWED_COMMANDS.has(command)) {
      return NextResponse.json({ error: `Command '${command}' not allowed` }, { status: 400 })
    }

    if (!validateAgentName(agent)) {
      return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
    }

    const start = Date.now()
    const result = command === 'health'
      ? await getHealthState(agent)
      : await runCommand(agent, command, extra)
    const durationMs = Date.now() - start

    const stdout = 'raw' in result ? result.raw : result.stdout
    const stderr = 'stderr' in result ? result.stderr : ''
    const code = result.code

    return NextResponse.json({
      command,
      output: stdout || stderr,
      success: code === 0,
      durationMs,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
