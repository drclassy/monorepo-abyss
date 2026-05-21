import type { FetchLike, LiteratureRecord, LiteratureSearchOptions } from './types.js'
import { normalizeAuthors, normalizeText, normalizeYear } from './utils.js'

const EUROPE_PMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest'
const NCBI_EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const CROSSREF_BASE = 'https://api.crossref.org'

function toQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value)
  }
  return searchParams.toString()
}

function filterByYear(
  records: LiteratureRecord[],
  options: LiteratureSearchOptions
): LiteratureRecord[] {
  return records.filter((record) => {
    if (options.yearFrom && (record.publishedYear ?? 0) < options.yearFrom) return false
    if (options.yearTo && (record.publishedYear ?? 0) > options.yearTo) return false
    return true
  })
}

function safeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return normalizeText(value)
  }
  return undefined
}

function getArticleId(
  articleIds: Array<{ idtype?: string; value?: string }> | undefined,
  idtype: string
): string | undefined {
  return articleIds?.find((item) => item.idtype?.toLowerCase() === idtype.toLowerCase())?.value
}

export function buildEuropePmcSearchUrl(
  query: string,
  options: LiteratureSearchOptions = {}
): string {
  const search = options.openAccessOnly === false ? query : `${query} OPEN_ACCESS:Y`
  const qs = toQueryString({
    query: search,
    format: 'json',
    pageSize: String(options.limit ?? 20),
    resultType: 'core',
    sort: 'relevance',
    email: options.email,
  })
  return `${EUROPE_PMC_BASE}/search?${qs}`
}

export async function searchEuropePmc(
  query: string,
  options: LiteratureSearchOptions = {},
  fetchImpl: FetchLike = fetch
): Promise<LiteratureRecord[]> {
  const response = await fetchImpl(buildEuropePmcSearchUrl(query, options))
  if (!response.ok)
    throw new Error(`Europe PMC search failed (${response.status}): ${await response.text()}`)

  const data = (await response.json()) as {
    resultList?: {
      result?: Array<Record<string, unknown>>
    }
  }

  const records = (data.resultList?.result ?? []).map((hit) => {
    const pmcid = pickString(
      hit.pmcid,
      typeof hit.id === 'string' && hit.id.startsWith('PMC') ? hit.id : undefined
    )
    const doi = pickString(hit.doi)
    const title = pickString(hit.title) ?? 'Untitled article'

    return {
      source: 'europe-pmc' as const,
      sourceId: pickString(hit.id, pmcid, doi) ?? title,
      title,
      abstract: pickString(hit.abstractText),
      doi,
      pmid: pickString(hit.pmid),
      pmcid,
      journal: pickString(hit.journalTitle),
      publishedYear: normalizeYear(hit.pubYear ?? hit.firstPublicationDate),
      authors: normalizeAuthors(hit.authorString),
      license: pickString(hit.license),
      openAccess:
        String(hit.isOpenAccess ?? '').toUpperCase() === 'Y' ||
        Boolean(pmcid) ||
        Boolean(hit.license),
      url:
        pickString(hit.webUrl) ??
        (pmcid
          ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmcid}/`
          : doi
            ? `https://doi.org/${doi}`
            : undefined),
      fullTextUrl: pmcid
        ? `${EUROPE_PMC_BASE}/${encodeURIComponent(pmcid)}/fullTextXML`
        : undefined,
      score: safeNumber(hit.score),
    } satisfies LiteratureRecord
  })

  return filterByYear(records, options)
}

export function buildPubMedSearchUrl(query: string, options: LiteratureSearchOptions = {}): string {
  const qs = toQueryString({
    db: 'pubmed',
    term: query,
    retmode: 'json',
    retmax: String(options.limit ?? 20),
    email: options.email,
  })
  return `${NCBI_EUTILS_BASE}/esearch.fcgi?${qs}`
}

export async function searchPubMed(
  query: string,
  options: LiteratureSearchOptions = {},
  fetchImpl: FetchLike = fetch
): Promise<LiteratureRecord[]> {
  const searchResponse = await fetchImpl(buildPubMedSearchUrl(query, options))
  if (!searchResponse.ok)
    throw new Error(
      `PubMed search failed (${searchResponse.status}): ${await searchResponse.text()}`
    )

  const searchData = (await searchResponse.json()) as {
    esearchresult?: {
      idlist?: string[]
    }
  }

  const pmids = searchData.esearchresult?.idlist ?? []
  if (pmids.length === 0) return []

  const summaryUrl = `${NCBI_EUTILS_BASE}/esummary.fcgi?${toQueryString({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'json',
    email: options.email,
  })}`
  const summaryResponse = await fetchImpl(summaryUrl)
  if (!summaryResponse.ok)
    throw new Error(
      `PubMed summary failed (${summaryResponse.status}): ${await summaryResponse.text()}`
    )

  const summaryData = (await summaryResponse.json()) as {
    result?: Record<string, unknown>
  }

  const result = summaryData.result ?? {}
  const records: LiteratureRecord[] = []

  for (const pmid of pmids) {
    const item = result[pmid] as Record<string, unknown> | undefined
    if (!item) continue

    const articleIds = Array.isArray(item.articleids)
      ? (item.articleids as Array<{ idtype?: string; value?: string }>)
      : undefined
    const pmcid = getArticleId(articleIds, 'pmc') ?? getArticleId(articleIds, 'pmcid')
    const doi = getArticleId(articleIds, 'doi')
    const title = pickString(item.title) ?? 'Untitled article'
    const author = pickString(item.sortfirstauthor)

    records.push({
      source: 'pubmed',
      sourceId: pmid,
      title,
      abstract: undefined,
      doi,
      pmid,
      pmcid,
      journal: pickString(item.fulljournalname, item.source),
      publishedYear: normalizeYear(item.pubdate ?? item.sortpubdate),
      authors: author ? [author] : undefined,
      openAccess: Boolean(pmcid),
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      fullTextUrl: pmcid
        ? `${EUROPE_PMC_BASE}/${encodeURIComponent(pmcid)}/fullTextXML`
        : undefined,
      score: safeNumber(item.score),
    })
  }

  return filterByYear(records, options)
}

export function buildCrossrefSearchUrl(
  query: string,
  options: LiteratureSearchOptions = {}
): string {
  const qs = toQueryString({
    query,
    rows: String(options.limit ?? 20),
  })
  return `${CROSSREF_BASE}/works?${qs}`
}

export async function searchCrossref(
  query: string,
  options: LiteratureSearchOptions = {},
  fetchImpl: FetchLike = fetch
): Promise<LiteratureRecord[]> {
  const response = await fetchImpl(buildCrossrefSearchUrl(query, options))
  if (!response.ok)
    throw new Error(`Crossref search failed (${response.status}): ${await response.text()}`)

  const data = (await response.json()) as {
    message?: {
      items?: Array<Record<string, unknown>>
    }
  }

  const records = (data.message?.items ?? []).map((item) => {
    const doi = pickString(item.DOI)
    const titleValue = Array.isArray(item.title) ? item.title[0] : item.title
    const title = pickString(titleValue) ?? 'Untitled article'
    const authors = Array.isArray(item.author)
      ? item.author
          .map((author) => {
            const person = author as Record<string, unknown>
            const given = pickString(person.given)
            const family = pickString(person.family)
            return [given, family].filter(Boolean).join(' ')
          })
          .filter(Boolean)
      : undefined

    const issued =
      (item['published-print'] as Record<string, unknown> | undefined) ??
      (item['published-online'] as Record<string, unknown> | undefined) ??
      (item.issued as Record<string, unknown> | undefined)
    const dateParts = Array.isArray(issued?.['date-parts'])
      ? (issued?.['date-parts'] as Array<Array<number | string>>)
      : undefined

    const year = Array.isArray(dateParts?.[0]) ? Number(dateParts?.[0]?.[0]) : undefined
    const license = Array.isArray(item.license)
      ? pickString((item.license[0] as Record<string, unknown> | undefined)?.URL)
      : undefined

    return {
      source: 'crossref' as const,
      sourceId: pickString(item.DOI, title) ?? title,
      title,
      abstract: pickString(item.abstract),
      doi,
      journal: pickString(
        Array.isArray(item['container-title'])
          ? item['container-title'][0]
          : item['container-title']
      ),
      publishedYear: normalizeYear(year),
      authors,
      license,
      openAccess: Boolean(license),
      url: pickString(item.URL),
      fullTextUrl: undefined,
      score: safeNumber(item.score),
    } satisfies LiteratureRecord
  })

  return filterByYear(records, options)
}
