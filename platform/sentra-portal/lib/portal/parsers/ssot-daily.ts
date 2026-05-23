import fs from 'node:fs/promises'
import path from 'node:path'

import { getSsotDailyDir } from '../safe-path'

export interface SsotDailyMeta {
  filename: string
  modifiedAt: string
  excerpt: string
}

export async function getLatestSsotDailyReport(): Promise<SsotDailyMeta | null> {
  const dir = getSsotDailyDir()

  let entries: { name: string; full: string }[] = []
  try {
    const names = await fs.readdir(dir)
    entries = names
      .filter((name) => name.endsWith('.md') && !name.includes('backup'))
      .map((name) => ({ name, full: path.join(dir, name) }))
  } catch {
    return null
  }

  if (entries.length === 0) return null

  const withStat = await Promise.all(
    entries.map(async (entry) => {
      const stat = await fs.stat(entry.full)
      return { ...entry, mtime: stat.mtimeMs }
    })
  )

  withStat.sort((a, b) => b.mtime - a.mtime)
  const latest = withStat[0]
  const text = await fs.readFile(latest.full, 'utf8')

  return {
    filename: latest.name,
    modifiedAt: new Date(latest.mtime).toISOString(),
    excerpt: text.slice(0, 600),
  }
}
