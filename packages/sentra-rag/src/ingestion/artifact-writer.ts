// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import * as fs from 'fs'
import * as path from 'path'
import type { CanonicalDocument, ChunkerInput } from '@the-abyss/document-ingestion'

export interface ArtifactPaths {
  artifactDir: string
  canonicalPath: string
  markdownPath: string
  chunksPath?: string
  qualityReportPath: string
}

export interface WriteKnowledgeArtifactsParams {
  outputDir: string
  canonical: CanonicalDocument
  markdown: string
  chunks: ChunkerInput[]
}

export async function writeKnowledgeArtifacts(
  params: WriteKnowledgeArtifactsParams
): Promise<ArtifactPaths> {
  const { outputDir, canonical, markdown, chunks } = params

  const artifactDir = path.join(outputDir, 'processed', canonical.sourceHash)
  fs.mkdirSync(artifactDir, { recursive: true })

  const canonicalPath = path.join(artifactDir, 'canonical.json')
  fs.writeFileSync(canonicalPath, JSON.stringify(canonical, null, 2), 'utf8')

  const markdownPath = path.join(artifactDir, 'document.md')
  fs.writeFileSync(markdownPath, markdown, 'utf8')

  const qualityReportPath = path.join(artifactDir, 'quality-report.json')
  fs.writeFileSync(qualityReportPath, JSON.stringify(canonical.qualityReport, null, 2), 'utf8')

  let chunksPath: string | undefined
  if (canonical.qualityReport.status !== 'failed') {
    chunksPath = path.join(artifactDir, 'chunks.json')
    fs.writeFileSync(chunksPath, JSON.stringify(chunks, null, 2), 'utf8')
  }

  return { artifactDir, canonicalPath, markdownPath, chunksPath, qualityReportPath }
}
