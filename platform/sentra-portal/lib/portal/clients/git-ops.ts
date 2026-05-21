import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

import { getRepoRoot } from '../repo-root'
import type { DirtyCategory, DirtyItem } from '../types'

const REQUIRED_AGENT_FILES = [
  'README.md',
  'CONTEXT.md',
  'DECISIONS.md',
  'HANDOFF.md',
  'PROGRESS.md',
]

function classifyDirtyPath(status: string, file: string): DirtyCategory {
  const normalized = file.replace(/\\/g, '/')

  if (
    normalized.includes('.env') ||
    normalized.startsWith('packages/sentra/') ||
    normalized.startsWith('infrastructure/') ||
    normalized === 'pnpm-lock.yaml'
  ) {
    return 'RISK'
  }

  if (
    normalized.startsWith('.codex/') ||
    normalized.startsWith('.cursor/') ||
    normalized.startsWith('apps/corporate/ferdiiskandar/') ||
    normalized.startsWith('.agent/reports/ssot-daily/') ||
    normalized.startsWith('.agent/sessions/')
  ) {
    return 'HOLD'
  }

  if (
    status.includes('D') ||
    normalized.startsWith('docs/archive/') ||
    normalized.startsWith('docs/handbook/')
  ) {
    return 'REVIEW'
  }

  return 'KEEP'
}

export function getDirtyItems(): DirtyItem[] {
  const cwd = getRepoRoot()
  let stdout = ''

  try {
    stdout = execSync('git status --short', { cwd, encoding: 'utf8' })
  } catch {
    return []
  }

  return stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const status = line.slice(0, 2).trim() || line.slice(0, 2)
      const file = line.slice(3).trim()
      return { status, file, category: classifyDirtyPath(status, file) }
    })
}

export function summarizeDirty(items: DirtyItem[]): Record<DirtyCategory, DirtyItem[]> {
  return {
    KEEP: items.filter((item) => item.category === 'KEEP'),
    REVIEW: items.filter((item) => item.category === 'REVIEW'),
    HOLD: items.filter((item) => item.category === 'HOLD'),
    RISK: items.filter((item) => item.category === 'RISK'),
  }
}

export function getBranch(): string {
  try {
    return execSync('git branch --show-current', { cwd: getRepoRoot(), encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

export function getHeadShort(): string {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: getRepoRoot(), encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

async function countDirectories(folderPath: string): Promise<number> {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true })
    return entries.filter((entry) => entry.isDirectory()).length
  } catch {
    return 0
  }
}

export async function countApps(): Promise<number> {
  const appsPath = path.join(getRepoRoot(), 'apps')
  let appCount = 0

  try {
    const domains = await fs.readdir(appsPath, { withFileTypes: true })
    for (const domain of domains) {
      if (!domain.isDirectory()) continue
      const domainPath = path.join(appsPath, domain.name)
      const apps = await fs.readdir(domainPath, { withFileTypes: true })
      appCount += apps.filter((app) => app.isDirectory()).length
    }
  } catch {
    return 0
  }

  return appCount
}

export async function getMissingAgentFiles(): Promise<string[]> {
  const agentDir = path.join(getRepoRoot(), '.agent')
  const missing: string[] = []

  for (const fileName of REQUIRED_AGENT_FILES) {
    try {
      await fs.access(path.join(agentDir, fileName))
    } catch {
      missing.push(fileName)
    }
  }

  return missing
}

export async function countTopPackages(): Promise<number> {
  return countDirectories(path.join(getRepoRoot(), 'packages'))
}
