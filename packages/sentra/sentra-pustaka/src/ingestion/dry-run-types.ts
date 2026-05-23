// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
export type DryRunDocumentStatus = 'ready' | 'needs_review' | 'failed' | 'skipped_duplicate'

export interface DryRunDocumentResult {
  filePath: string
  sourceHash?: string
  documentTitle?: string
  status: DryRunDocumentStatus
  artifactPaths?: {
    artifactDir?: string
    canonicalPath?: string
    markdownPath?: string
    chunksPath?: string
    qualityReportPath?: string
  }
  warnings: string[]
  error?: string
}

export interface IngestionSummary {
  runId: string
  startedAt: string
  completedAt: string
  inputDir: string
  outputDir: string
  totalDiscoveredPdfs: number
  processedCount: number
  readyCount: number
  needsReviewCount: number
  failedCount: number
  skippedDuplicateCount: number
  results: DryRunDocumentResult[]
}
