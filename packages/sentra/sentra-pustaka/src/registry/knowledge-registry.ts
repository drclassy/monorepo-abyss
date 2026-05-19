// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import * as fs from 'fs'
import * as path from 'path'

import { createEligibleForEmbeddingExport } from './eligibility-exporter'
import { readKnowledgeRegistry } from './registry-reader'
import { buildRegistrySummary } from './registry-summary'
import type {
  KnowledgeRegistry,
  KnowledgeSourceRegistryEntry,
  QualityStatus,
  RegistrySummary,
} from './registry-types'
import { mapQualityToRegistryStatus } from './registry-types'
import { writeKnowledgeRegistry, writeRegistryExport } from './registry-writer'

interface IngestionSummaryResult {
  filePath: string
  sourceHash?: string
  documentTitle?: string
  status: string
  artifactPaths?: {
    canonicalPath?: string
    markdownPath?: string
    chunksPath?: string
    qualityReportPath?: string
  }
  warnings?: string[]
}

interface IngestionSummaryFile {
  results: IngestionSummaryResult[]
}

interface CanonicalJsonDocument {
  documentId: string
  sourceHash: string
  documentVersion: string
  documentTitle?: string
  parserProvider: string
  createdAt: string
  preflight?: { documentType?: string }
  qualityReport: { status: string; warnings: string[]; totalPages: number }
  pages: unknown[]
  metadata: { pageCount: number }
}

function countChunks(chunksPath?: string): number {
  if (!chunksPath || !fs.existsSync(chunksPath)) return 0
  try {
    const raw = JSON.parse(fs.readFileSync(chunksPath, 'utf8'))
    return Array.isArray(raw) ? raw.length : 0
  } catch {
    return 0
  }
}

function sanitizeQualityStatus(status: string): QualityStatus {
  if (status === 'ready' || status === 'needs_review' || status === 'failed') return status
  return 'failed'
}

export async function updateKnowledgeRegistry(params: {
  artifactsDir: string
  registryDir: string
  force?: boolean
}): Promise<RegistrySummary> {
  const { artifactsDir, registryDir } = params
  const startedAt = new Date().toISOString()

  const summaryPath = path.join(artifactsDir, 'ingestion-summary.json')
  if (!fs.existsSync(summaryPath)) {
    throw new Error(`ingestion-summary.json not found at: ${summaryPath}`)
  }

  const summary: IngestionSummaryFile = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
  const existing = await readKnowledgeRegistry(registryDir)

  const existingByHash = new Map<string, KnowledgeSourceRegistryEntry>(
    existing.entries.map((e) => [e.source_hash, e])
  )

  const processedResults = summary.results.filter(
    (r) => r.status !== 'skipped_duplicate' && r.sourceHash
  )

  for (const result of processedResults) {
    if (!result.sourceHash) continue
    const hash = result.sourceHash
    const existing = existingByHash.get(hash)

    const canonicalPath = result.artifactPaths?.canonicalPath
    let canonical: CanonicalJsonDocument | null = null

    if (canonicalPath && fs.existsSync(canonicalPath)) {
      try {
        canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'))
      } catch {
        // proceed with result data
      }
    }

    const qualityStatus = sanitizeQualityStatus(canonical?.qualityReport.status ?? result.status)

    const registryStatus =
      existing?.registry_status === 'approved_for_embedding' && !params.force
        ? 'approved_for_embedding'
        : mapQualityToRegistryStatus(qualityStatus)

    const entry: KnowledgeSourceRegistryEntry = {
      source_hash: hash,
      document_id: canonical?.documentId ?? hash,
      document_title: canonical?.documentTitle ?? result.documentTitle,
      document_version: canonical?.documentVersion ?? '1.0',
      document_type: canonical?.preflight?.documentType,
      parser_provider: canonical?.parserProvider ?? 'liteparse',
      page_count: canonical?.metadata.pageCount ?? 0,
      chunk_count: countChunks(result.artifactPaths?.chunksPath),
      quality_status: qualityStatus,
      registry_status: registryStatus,
      created_at: canonical?.createdAt ?? startedAt,
      registered_at: existing?.registered_at ?? startedAt,
      artifact_paths: {
        canonical_path: result.artifactPaths?.canonicalPath,
        markdown_path: result.artifactPaths?.markdownPath,
        chunks_path: result.artifactPaths?.chunksPath,
        quality_report_path: result.artifactPaths?.qualityReportPath,
      },
      warnings: canonical?.qualityReport.warnings ?? result.warnings ?? [],
      supersedes: existing?.supersedes,
      superseded_by: existing?.superseded_by,
    }

    existingByHash.set(hash, entry)
  }

  const updatedRegistry: KnowledgeRegistry = {
    schema_version: '1.0.0',
    updated_at: new Date().toISOString(),
    entries: Array.from(existingByHash.values()),
  }

  await writeKnowledgeRegistry({ registryDir, registry: updatedRegistry })

  const registrySummary = buildRegistrySummary(updatedRegistry, startedAt)
  writeRegistryExport(registryDir, 'registry-summary.json', registrySummary)

  const eligibleEntries = createEligibleForEmbeddingExport(updatedRegistry)
  writeRegistryExport(registryDir, 'eligible-for-embedding.json', eligibleEntries)

  const needsReviewEntries = updatedRegistry.entries.filter(
    (e) => e.registry_status === 'needs_review'
  )
  writeRegistryExport(registryDir, 'needs-review.json', needsReviewEntries)

  const failedEntries = updatedRegistry.entries.filter((e) => e.registry_status === 'failed')
  writeRegistryExport(registryDir, 'failed.json', failedEntries)

  const supersededEntries = updatedRegistry.entries.filter(
    (e) => e.registry_status === 'superseded'
  )
  writeRegistryExport(registryDir, 'superseded.json', supersededEntries)

  return registrySummary
}
