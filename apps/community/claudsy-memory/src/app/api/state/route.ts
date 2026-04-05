import { NextRequest, NextResponse } from 'next/server'
import { getDaemonStatus, getHealthState, getServerBaseDir, listAgents, validateAgentName } from '@/lib/engine'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const agent = searchParams.get('agent') ?? 'claude-code'

  if (!validateAgentName(agent)) {
    return NextResponse.json({ error: 'Invalid agent name' }, { status: 400 })
  }

  const baseDir = getServerBaseDir()

  try {
    const [healthState, agents] = await Promise.all([
      getHealthState(agent),
      listAgents(),
    ])
    return NextResponse.json({
      health: healthState.raw,
      healthSummary: healthState.healthSummary,
      healthHistory: healthState.healthHistory,
      engineState: healthState.engineState,
      daemon: getDaemonStatus(),
      agents,
      agent,
      baseDir,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
