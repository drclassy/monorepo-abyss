import fs from 'node:fs/promises'

import { getAgentDir } from '../safe-path'

const ALLOWED_FILES = new Set([
  'README.md',
  'CONTEXT.md',
  'HANDOFF.md',
  'DECISIONS.md',
  'PROGRESS.md',
])
const ALLOWED_DIRS = new Set(['reports', 'sessions', 'archive'])

export async function listAgentShapeViolations(): Promise<string[]> {
  const agentDir = getAgentDir()
  const bad: string[] = []

  try {
    const entries = await fs.readdir(agentDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      if (entry.isDirectory()) {
        if (!ALLOWED_DIRS.has(entry.name)) bad.push(`${entry.name}/`)
      } else if (!ALLOWED_FILES.has(entry.name)) {
        bad.push(entry.name)
      }
    }
  } catch {
    return ['.agent directory missing']
  }

  return bad
}

export const PROTECTED_PATHS = [
  'packages/sentra/sentra-bentara/src/auth.ts',
  'packages/sentra/sentra-nada/src/__tests__/*',
  'apps/corporate/ferdiiskandar/AGENTS.md',
]
