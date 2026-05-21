import fs from 'node:fs/promises'

import { getAgentSessionsDir } from '../safe-path'

export async function buildSessionHeatmap(days = 14): Promise<{ date: string; count: number }[]> {
  const sessionsDir = getAgentSessionsDir()

  let entries: string[] = []
  try {
    entries = await fs.readdir(sessionsDir)
  } catch {
    return []
  }

  const counts = new Map<string, number>()
  for (const name of entries) {
    if (!name.endsWith('.md')) continue
    const date = name.replace('.md', '').slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }

  const result: { date: string; count: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, count: counts.get(key) ?? 0 })
  }

  return result
}

export async function countSessionLogs(): Promise<number> {
  const sessionsDir = getAgentSessionsDir()
  try {
    const entries = await fs.readdir(sessionsDir)
    return entries.filter((entry) => entry.toLowerCase().endsWith('.md')).length
  } catch {
    return 0
  }
}
