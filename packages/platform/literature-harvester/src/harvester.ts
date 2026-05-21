import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { searchCrossref, searchEuropePmc, searchPubMed } from './connectors.js'
import type {
  FetchLike,
  HarvestRunResult,
  HarvestedRecord,
  HarvesterConfig,
  LiteratureRecord,
  LiteratureSearchOptions,
} from './types.js'
import { createTimestamp, dedupeRecords, slugify, sortRecords } from './utils.js'

const SOURCE_DIR = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_OUTPUT_DIR = path.resolve(SOURCE_DIR, '../../../library/medical/literature-harvests')

function normalizeSources(sources?: HarvesterConfig['sources']): HarvesterConfig['sources'] {
  return sources && sources.length > 0 ? sources : ['europe-pmc', 'pubmed', 'crossref']
}

function buildRunId(query: string): string {
  return `${slugify(query)}-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`
}

function buildRecordFileName(record: LiteratureRecord): string {
  return slugify(record.doi ?? record.pmcid ?? record.pmid ?? record.sourceId ?? record.title)
}

async function downloadText(fetchImpl: FetchLike, url: string): Promise<string> {
  const response = await fetchImpl(url)
  if (!response.ok)
    throw new Error(`Download failed (${response.status}): ${await response.text()}`)
  return response.text()
}

export class LiteratureHarvester {
  private readonly outputDir: string
  private readonly sources: NonNullable<HarvesterConfig['sources']>
  private readonly limit: number
  private readonly openAccessOnly: boolean
  private readonly email?: string
  private readonly fetchImpl: FetchLike

  constructor(config: HarvesterConfig = {}) {
    this.outputDir = config.outputDir ?? DEFAULT_OUTPUT_DIR
    this.sources = normalizeSources(config.sources) ?? ['europe-pmc', 'pubmed', 'crossref']
    this.limit = config.limit ?? 20
    this.openAccessOnly = config.openAccessOnly ?? true
    this.email = config.email
    this.fetchImpl = config.fetchImpl ?? fetch
  }

  async search(query: string, options: LiteratureSearchOptions = {}): Promise<LiteratureRecord[]> {
    const searchOptions: LiteratureSearchOptions = {
      limit: options.limit ?? this.limit,
      openAccessOnly: options.openAccessOnly ?? this.openAccessOnly,
      yearFrom: options.yearFrom,
      yearTo: options.yearTo,
      email: options.email ?? this.email,
    }

    const records: LiteratureRecord[] = []

    for (const source of this.sources) {
      if (source === 'europe-pmc') {
        records.push(...(await searchEuropePmc(query, searchOptions, this.fetchImpl)))
      }

      if (source === 'pubmed') {
        records.push(...(await searchPubMed(query, searchOptions, this.fetchImpl)))
      }

      if (source === 'crossref') {
        records.push(...(await searchCrossref(query, searchOptions, this.fetchImpl)))
      }
    }

    const deduped = dedupeRecords(records)
    const filtered = searchOptions.openAccessOnly
      ? deduped.filter((record) => record.openAccess || Boolean(record.fullTextUrl))
      : deduped
    return sortRecords(filtered).slice(0, searchOptions.limit ?? this.limit)
  }

  async harvest(query: string, options: LiteratureSearchOptions = {}): Promise<HarvestRunResult> {
    const searchOptions: LiteratureSearchOptions = {
      limit: options.limit ?? this.limit,
      openAccessOnly: options.openAccessOnly ?? this.openAccessOnly,
      yearFrom: options.yearFrom,
      yearTo: options.yearTo,
      email: options.email ?? this.email,
    }

    const runId = buildRunId(query)
    const outputDir = path.join(this.outputDir, runId)
    const recordsDir = path.join(outputDir, 'records')

    await mkdir(recordsDir, { recursive: true })

    const records = await this.search(query, searchOptions)
    const harvested: HarvestedRecord[] = []
    let downloaded = 0
    let metadataOnly = 0
    let failed = 0

    for (const record of records) {
      const baseName = buildRecordFileName(record)
      const metadataPath = path.join(recordsDir, `${baseName}.json`)
      const retrievedAt = createTimestamp()

      await writeFile(
        metadataPath,
        JSON.stringify(
          {
            ...record,
            query,
            retrievedAt,
            runId,
          },
          null,
          2
        ),
        'utf8'
      )

      let contentPath: string | undefined
      let status: HarvestedRecord['status'] = 'metadata-only'
      let error: string | undefined

      if (record.fullTextUrl) {
        try {
          const content = await downloadText(this.fetchImpl, record.fullTextUrl)
          contentPath = path.join(recordsDir, `${baseName}.xml`)
          await writeFile(contentPath, content, 'utf8')
          status = 'downloaded'
          downloaded++
        } catch (downloadError) {
          status = 'failed'
          error = downloadError instanceof Error ? downloadError.message : String(downloadError)
          failed++
        }
      } else {
        metadataOnly++
      }

      harvested.push({
        ...record,
        status,
        metadataPath,
        contentPath,
        error,
        retrievedAt,
      })
    }

    const manifestPath = path.join(outputDir, 'manifest.json')
    const manifest: HarvestRunResult = {
      query,
      runId,
      outputDir,
      manifestPath,
      records: harvested,
      counts: {
        searched: records.length,
        downloaded,
        metadataOnly,
        failed,
      },
    }

    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
    return manifest
  }
}

export async function harvestLiterature(
  query: string,
  config: HarvesterConfig = {},
  options: LiteratureSearchOptions = {}
): Promise<HarvestRunResult> {
  return new LiteratureHarvester(config).harvest(query, options)
}
