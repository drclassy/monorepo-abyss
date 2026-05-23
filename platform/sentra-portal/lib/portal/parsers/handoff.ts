export interface HandoffParsed {
  nextAction: string
  nextActionFull: string
  snapshot: string
  blockers: string[]
  activeWork: string
  mode: string
  snapshotNext: string
}

export function parseHandoff(markdown: string): HandoffParsed {
  const snapshot = extractSection(markdown, 'Snapshot')
  const snapshotFields = parseSnapshotFields(snapshot)

  let nextActionRaw =
    extractSection(markdown, 'Next Action') || extractSection(markdown, 'Suggested Next Action')

  if (!nextActionRaw) {
    const inline = markdown.match(/\*\*Next Action:\*\*\s*\n([\s\S]*?)(?=\n## |\n\*\*[A-Z]|$)/i)
    if (inline?.[1]) nextActionRaw = inline[1]
  }

  if (!nextActionRaw && snapshotFields.snapshotNext) {
    nextActionRaw = snapshotFields.snapshotNext
  }

  const nextActionFull = cleanActionText(nextActionRaw)
  const nextAction = firstParagraph(nextActionFull)

  const blockers = [
    ...extractBullets(extractSection(markdown, 'Blocker') || extractSection(markdown, 'Blockers')),
    ...extractNumbered(extractSection(markdown, 'Remaining Follow-Up')),
  ].slice(0, 8)

  return {
    nextAction,
    nextActionFull,
    snapshot,
    blockers,
    activeWork: snapshotFields.activeWork,
    mode: snapshotFields.mode,
    snapshotNext: snapshotFields.snapshotNext,
  }
}

export function parseSnapshotFields(snapshot: string): {
  activeWork: string
  mode: string
  snapshotNext: string
} {
  const pick = (key: string) => {
    const re = new RegExp(`^-\\s*${key}:\\s*(.+)$`, 'im')
    return snapshot.match(re)?.[1]?.replace(/`/g, '').trim() ?? ''
  }

  return {
    activeWork: pick('Active work'),
    mode: pick('Mode'),
    snapshotNext: pick('Next'),
  }
}

export function parseRagPhaseNotes(markdown: string): string[] {
  const section = extractSection(markdown, 'RAG Enhancement Plan')
  if (!section) return []

  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /phase\s+\d/i.test(line))
    .map((line) => line.replace(/^-\s*/, '').replace(/\*\*/g, '').trim())
    .slice(0, 5)
}

export function extractSection(md: string, title: string): string {
  const re = new RegExp(`## ${title}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i')
  const match = md.match(re)
  return match?.[1]?.trim() ?? ''
}

function extractBullets(section: string): string[] {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
}

function extractNumbered(section: string): string[] {
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s/.test(line))
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
}

function cleanActionText(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '\n').trim()
}

function firstParagraph(text: string): string {
  const stripped = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!stripped) return ''
  const parts = stripped.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (parts[0] && parts[0].length >= 40) return parts.slice(0, 2).join(' ')
  return stripped.slice(0, 320)
}
