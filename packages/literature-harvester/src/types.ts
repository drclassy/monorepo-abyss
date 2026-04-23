export type LiteratureSource = 'europe-pmc' | 'pubmed' | 'crossref'

export type HarvestStatus = 'downloaded' | 'metadata-only' | 'failed'

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export interface LiteratureSearchOptions {
  limit?: number
  openAccessOnly?: boolean
  yearFrom?: number
  yearTo?: number
  email?: string
}

export interface LiteratureRecord {
  source: LiteratureSource
  sourceId: string
  title: string
  abstract?: string
  doi?: string
  pmid?: string
  pmcid?: string
  journal?: string
  publishedYear?: number
  authors?: string[]
  license?: string
  openAccess: boolean
  url?: string
  fullTextUrl?: string
  score?: number
}

export interface HarvestedRecord extends LiteratureRecord {
  status: HarvestStatus
  metadataPath: string
  contentPath?: string
  error?: string
  retrievedAt: string
}

export interface HarvestRunResult {
  query: string
  runId: string
  outputDir: string
  manifestPath: string
  records: HarvestedRecord[]
  counts: {
    searched: number
    downloaded: number
    metadataOnly: number
    failed: number
  }
}

export interface HarvesterConfig {
  outputDir?: string
  sources?: LiteratureSource[]
  limit?: number
  openAccessOnly?: boolean
  email?: string
  fetchImpl?: FetchLike
}
