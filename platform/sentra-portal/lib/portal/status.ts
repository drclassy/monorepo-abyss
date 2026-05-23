import type { PortalStatus } from './types'

export function freshnessStatus(hours: number | null): PortalStatus {
  if (hours === null) return 'unknown'
  if (hours < 24) return 'ok'
  if (hours < 72) return 'warn'
  return 'critical'
}

export function hoursSince(mtimeMs: number): number {
  return (Date.now() - mtimeMs) / 3_600_000
}

export function truncate(text: string, max = 120): string {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}
