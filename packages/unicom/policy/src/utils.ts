import type { UnicomEvent, UnicomTask } from '@the-abyss/unicom-core'

export function extractPaths(event: UnicomEvent): string[] {
  const payload = event.payload as Record<string, unknown> | null
  if (!payload) {
    return []
  }

  const keys = ['targetPaths', 'expectedFiles', 'filesTouched', 'paths']
  const values = keys.flatMap((key) => {
    const candidate = payload[key]
    return Array.isArray(candidate)
      ? candidate.filter((value): value is string => typeof value === 'string')
      : []
  })

  return [...new Set(values)]
}

export function payloadText(event: UnicomEvent): string {
  try {
    return JSON.stringify(event.payload).toLowerCase()
  } catch {
    return ''
  }
}

export function pathMatches(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix))
}

export function assertScopePaths(
  task: UnicomTask,
  event: UnicomEvent
): { allowed: boolean; reason?: string } {
  const paths = extractPaths(event)
  if (paths.length === 0) {
    return { allowed: true }
  }

  if (task.forbiddenPaths.some((prefix) => paths.some((path) => pathMatches(path, [prefix])))) {
    return { allowed: false, reason: 'Event targets forbidden task path.' }
  }

  if (task.allowedPaths.length > 0) {
    const outside = paths.find((path) => !pathMatches(path, task.allowedPaths))
    if (outside) {
      return { allowed: false, reason: `Event targets path outside allowed scope: ${outside}` }
    }
  }

  return { allowed: true }
}
