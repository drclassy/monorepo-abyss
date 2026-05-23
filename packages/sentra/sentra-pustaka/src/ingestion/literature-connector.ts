import crypto from 'node:crypto'

type LiteratureSource = 'europe-pmc' | 'pubmed' | 'crossref'

interface HarvestedRecord {
  source: LiteratureSource
  sourceId: string
  title: string
  openAccess: boolean
  publishedYear?: number
  status: 'downloaded' | 'metadata-only' | 'failed'
  contentPath?: string
}

interface HarvestManifest {
  records: HarvestedRecord[]
}

export interface LiteratureIngestionParams {
  registryDir: string
  artifactsDir: string
  autoApproveOpenAccess: boolean
  trustedSources: LiteratureSource[]
}

export interface LiteratureIngestionSummary {
  run_id: string
  records_attempted: number
  records_ingested: number
  records_auto_approved: number
  records_pending_review: number
  records_failed: number
  started_at: string
  completed_at: string
  status: 'completed' | 'completed_with_failures' | 'failed'
}

function buildRunId(): string {
  return `lit_${Date.now()}`
}

function buildSourceHash(record: HarvestedRecord): string {
  return crypto
    .createHash('sha256')
    .update(`${record.source}:${record.sourceId}`)
    .digest('hex')
    .slice(0, 32)
}

export async function ingestHarvestedLiterature(
  manifest: HarvestManifest,
  params: LiteratureIngestionParams,
): Promise<LiteratureIngestionSummary> {
  const runId = buildRunId()
  const startedAt = new Date().toISOString()
  const downloaded = manifest.records.filter(
    (record) => record.status === 'downloaded' && record.contentPath?.endsWith('.xml'),
  )

  let ingested = 0
  let autoApproved = 0
  let pendingReview = 0
  let failed = 0

  for (const record of downloaded) {
    try {
      const sourceHash = buildSourceHash(record)
      const isAutoApprove =
        params.autoApproveOpenAccess &&
        record.openAccess &&
        params.trustedSources.includes(record.source)

      const registryStatus = isAutoApprove ? 'approved_for_embedding' : 'ready_for_review'
      console.log(
        `[literature-connector][${runId}] ${record.sourceId} (${sourceHash}) -> ${registryStatus}`,
      )

      if (isAutoApprove) {
        autoApproved++
      } else {
        pendingReview++
      }

      ingested++
    } catch (error) {
      console.error(
        `[literature-connector][${runId}] Failed to ingest ${record.sourceId}: ${String(error)}`,
      )
      failed++
    }
  }

  const completedAt = new Date().toISOString()
  const status =
    failed === 0 ? 'completed' : ingested === 0 ? 'failed' : 'completed_with_failures'

  return {
    run_id: runId,
    records_attempted: downloaded.length,
    records_ingested: ingested,
    records_auto_approved: autoApproved,
    records_pending_review: pendingReview,
    records_failed: failed,
    started_at: startedAt,
    completed_at: completedAt,
    status,
  }
}
