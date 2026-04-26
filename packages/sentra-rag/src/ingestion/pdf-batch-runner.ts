import * as fs from 'fs'
import * as path from 'path'
import { ingestDocument, renderMarkdown, toChunkerInput } from '@the-abyss/document-ingestion'
import type { DryRunDocumentResult, IngestionSummary } from './dry-run-types'
import { discoverPdfFiles } from './pdf-discovery'
import { writeKnowledgeArtifacts } from './artifact-writer'
import { isDuplicate } from './duplicate-detector'
import { createSummaryHeader, finalizeSummary, sanitizeError, writeSummary } from './ingestion-summary'

export interface DryRunIngestionParams {
  inputDir: string
  outputDir: string
  force?: boolean
  limit?: number
}

export async function runPdfDryRunIngestion(
  params: DryRunIngestionParams
): Promise<IngestionSummary> {
  const { inputDir, outputDir, force, limit } = params

  const pdfs = await discoverPdfFiles(inputDir, { limit })
  const summary = createSummaryHeader({
    inputDir,
    outputDir,
    totalDiscoveredPdfs: pdfs.length,
  })

  const results: DryRunDocumentResult[] = []

  for (const filePath of pdfs) {
    const result = await processSinglePdf(filePath, outputDir, force)
    results.push(result)
  }

  const failedResults = results.filter((r) => r.status === 'failed')
  if (failedResults.length > 0) {
    const failedDir = path.join(outputDir, 'failed')
    fs.mkdirSync(failedDir, { recursive: true })
    fs.writeFileSync(
      path.join(failedDir, 'failures.json'),
      JSON.stringify(failedResults, null, 2),
      'utf8'
    )
  }

  const skippedResults = results.filter((r) => r.status === 'skipped_duplicate')
  if (skippedResults.length > 0) {
    const skippedDir = path.join(outputDir, 'skipped')
    fs.mkdirSync(skippedDir, { recursive: true })
    fs.writeFileSync(
      path.join(skippedDir, 'duplicates.json'),
      JSON.stringify(skippedResults, null, 2),
      'utf8'
    )
  }

  const finalized = finalizeSummary(summary, results)
  writeSummary(finalized, outputDir)

  return finalized
}

async function processSinglePdf(
  filePath: string,
  outputDir: string,
  force?: boolean
): Promise<DryRunDocumentResult> {
  let ingestionResult: Awaited<ReturnType<typeof ingestDocument>>

  try {
    ingestionResult = await ingestDocument({ filePath })
  } catch (err) {
    console.error(`[FAIL] ${path.basename(filePath)}: ${sanitizeError(err)}`)
    return {
      filePath,
      status: 'failed',
      warnings: [],
      error: sanitizeError(err),
    }
  }

  const { canonical } = ingestionResult
  const qualityReport = canonical.qualityReport

  if (isDuplicate(outputDir, canonical.sourceHash, force)) {
    return {
      filePath,
      sourceHash: canonical.sourceHash,
      documentTitle: canonical.documentTitle,
      status: 'skipped_duplicate',
      warnings: [],
    }
  }

  const markdown = renderMarkdown(canonical)
  const chunks = toChunkerInput(canonical)

  let artifactPaths: DryRunDocumentResult['artifactPaths']

  try {
    const written = await writeKnowledgeArtifacts({
      outputDir,
      canonical,
      markdown,
      chunks,
    })
    artifactPaths = written
  } catch (err) {
    console.error(`[FAIL] write artifacts ${path.basename(filePath)}: ${sanitizeError(err)}`)
    return {
      filePath,
      sourceHash: canonical.sourceHash,
      documentTitle: canonical.documentTitle,
      status: 'failed',
      warnings: qualityReport.warnings,
      error: sanitizeError(err),
    }
  }

  return {
    filePath,
    sourceHash: canonical.sourceHash,
    documentTitle: canonical.documentTitle,
    status: qualityReport.status as DryRunDocumentResult['status'],
    artifactPaths,
    warnings: qualityReport.warnings,
  }
}
