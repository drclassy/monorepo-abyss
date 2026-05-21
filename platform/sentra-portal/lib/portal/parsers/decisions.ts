export function parseDecisionsTail(markdown: string, maxEntries = 5): string[] {
  const lines = markdown.split('\n').map((line) => line.trim())
  const dated = lines.filter(
    (line) => /^##\s+\d{4}-\d{2}-\d{2}/.test(line) || /^-\s+\*\*/.test(line)
  )

  if (dated.length > 0) {
    return dated.slice(-maxEntries)
  }

  return lines.filter((line) => line.startsWith('- ')).slice(-maxEntries)
}

export function parseLatestDecision(markdown: string): string {
  const match = markdown.match(/^## (\d{4}-\d{2}-\d{2} - .+)$/m)
  return match?.[1] ?? ''
}
