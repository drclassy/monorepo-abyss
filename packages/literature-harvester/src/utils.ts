import type { LiteratureRecord } from './types.js'

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function slugify(value: string): string {
  const slug = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'article'
}

export function normalizeYear(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.slice(0, 4), 10)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

export function normalizeAuthors(value: unknown): string[] | undefined {
  if (typeof value !== 'string') return undefined

  const authors = value
    .split(/[;,]/)
    .map((part) => normalizeText(part))
    .filter(Boolean)

  return authors.length > 0 ? authors : undefined
}

export function recordKey(record: LiteratureRecord): string {
  return (
    record.doi?.toLowerCase() ||
    record.pmcid?.toLowerCase() ||
    record.pmid?.toLowerCase() ||
    normalizeText(record.title).toLowerCase()
  )
}

export function dedupeRecords(records: LiteratureRecord[]): LiteratureRecord[] {
  const seen = new Set<string>()
  const deduped: LiteratureRecord[] = []

  for (const record of records) {
    const key = recordKey(record)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(record)
  }

  return deduped
}

export function sourceRank(source: LiteratureRecord['source']): number {
  switch (source) {
    case 'europe-pmc':
      return 0
    case 'pubmed':
      return 1
    case 'crossref':
      return 2
  }
}

export function sortRecords(records: LiteratureRecord[]): LiteratureRecord[] {
  return [...records].sort((a, b) => {
    if (a.openAccess !== b.openAccess) return Number(b.openAccess) - Number(a.openAccess)

    if ((a.score ?? 0) !== (b.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0)

    if ((a.publishedYear ?? 0) !== (b.publishedYear ?? 0)) {
      return (b.publishedYear ?? 0) - (a.publishedYear ?? 0)
    }

    return sourceRank(a.source) - sourceRank(b.source)
  })
}

export function createTimestamp(): string {
  return new Date().toISOString()
}
