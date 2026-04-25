export type MedicalKnowledgeSearchStatus = 'SUCCESS' | 'EMPTY' | 'ERROR'

export interface MedicalKnowledgeHit {
  title: string
  uri: string
  snippet: string
}

export interface MedicalKnowledgeCitation {
  uri: string
  title: string
}

export interface MedicalKnowledgeSearchResponse {
  status: MedicalKnowledgeSearchStatus
  query: string
  answer: string
  hits: MedicalKnowledgeHit[]
  citations: MedicalKnowledgeCitation[]
  timestamp: string
  error?: string
}

function normalizeSnippet(input: unknown): string {
  if (typeof input !== 'string') return ''

  return input
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/?b>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function resolveTitle(result: any): string {
  return (
    result?.document?.derivedStructData?.title ??
    result?.document?.derivedStructData?.name ??
    result?.document?.name ??
    'Dokumen Medis'
  )
}

function resolveUri(result: any): string {
  return (
    result?.document?.derivedStructData?.link ??
    result?.document?.derivedStructData?.uri ??
    'N/A'
  )
}

function resolveSnippet(result: any): string {
  const derived = result?.document?.derivedStructData

  const rawSnippet =
    derived?.snippets?.[0]?.snippet ??
    derived?.extractive_answers?.[0]?.content ??
    ''

  return normalizeSnippet(rawSnippet)
}

export function mapMedicalKnowledgeResults(
  rawResults: any[] | undefined,
  options: { query: string; maxHits?: number },
): MedicalKnowledgeSearchResponse {
  const timestamp = new Date().toISOString()
  const query = options.query
  const maxHits = Math.max(1, Math.min(options.maxHits ?? 5, 20))

  if (!rawResults || rawResults.length === 0) {
    return {
      status: 'EMPTY',
      query,
      answer: 'Maaf Chief, tidak ada dokumen medis yang relevan ditemukan di database Sentra.',
      hits: [],
      citations: [],
      timestamp,
    }
  }

  const hits = rawResults.slice(0, maxHits).map((r) => {
    const title = resolveTitle(r)
    const uri = resolveUri(r)
    const snippet = resolveSnippet(r) || 'Dokumen ditemukan, tapi detail teks tidak tersedia.'

    return { title, uri, snippet }
  })

  const citations = hits.map((h) => ({ uri: h.uri, title: h.title }))
  const answer = hits[0]?.snippet ?? 'Dokumen ditemukan, tapi detail teks tidak tersedia.'

  return {
    status: 'SUCCESS',
    query,
    answer,
    hits,
    citations,
    timestamp,
  }
}
