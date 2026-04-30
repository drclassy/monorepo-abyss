// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import path from 'node:path'

import fs from 'fs-extra'
import { PDFParse } from 'pdf-parse'

import type { VectorStore } from '../store'

export interface MedicalPdfIngestOptions {
  pdfDir: string
  store: VectorStore
  chunkSize?: number
  chunkOverlap?: number
  delayMs?: number
  maxRetries?: number
  log?: (message: string) => void
}

export interface MedicalPdfIngestResult {
  filesProcessed: number
  chunksUpserted: number
  skippedFiles: string[]
}

const DEFAULT_CHUNK_SIZE = 3_000
const DEFAULT_CHUNK_OVERLAP = 300
const DEFAULT_DELAY_MS = 200
const DEFAULT_MAX_RETRIES = 3

export async function extractPdfText(filePath: string): Promise<string> {
  const parser = new PDFParse({ data: await fs.readFile(filePath) })

  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy()
  }
}

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  chunkOverlap = DEFAULT_CHUNK_OVERLAP,
): string[] {
  if (chunkSize <= 0) throw new Error('[ingest-medical-pdf] chunkSize must be positive')
  if (chunkOverlap < 0) throw new Error('[ingest-medical-pdf] chunkOverlap cannot be negative')
  if (chunkOverlap >= chunkSize) {
    throw new Error('[ingest-medical-pdf] chunkOverlap must be smaller than chunkSize')
  }

  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return []

  const chunks: string[] = []
  for (let start = 0; start < normalized.length; start += chunkSize - chunkOverlap) {
    const chunk = normalized.slice(start, start + chunkSize).trim()
    if (chunk) chunks.push(chunk)
  }

  return chunks
}

async function wait(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function withRetry<T>(
  action: () => Promise<T>,
  maxRetries: number,
  retryLabel: string,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await action()
    } catch (error) {
      lastError = error
      if (attempt === maxRetries) break
      await wait(500 * attempt)
    }
  }

  throw new Error(
    `[ingest-medical-pdf] ${retryLabel} failed after ${maxRetries} attempts: ${String(lastError)}`,
  )
}

export async function ingestMedicalPdfDirectory(
  options: MedicalPdfIngestOptions,
): Promise<MedicalPdfIngestResult> {
  const {
    pdfDir,
    store,
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
    delayMs = DEFAULT_DELAY_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    log = () => undefined,
  } = options

  const entries = await fs.readdir(pdfDir)
  const pdfFiles = entries.filter(file => file.toLowerCase().endsWith('.pdf')).sort()
  const result: MedicalPdfIngestResult = {
    filesProcessed: 0,
    chunksUpserted: 0,
    skippedFiles: [],
  }

  log(`[ingest-medical-pdf] found ${pdfFiles.length} PDF files in ${pdfDir}`)

  for (const file of pdfFiles) {
    const fullPath = path.join(pdfDir, file)
    const startedAt = Date.now()
    log(`[ingest-medical-pdf] processing ${file}`)

    const rawText = await extractPdfText(fullPath)
    const chunks = chunkText(rawText, chunkSize, chunkOverlap)

    if (chunks.length === 0) {
      result.skippedFiles.push(file)
      log(`[ingest-medical-pdf] skipped ${file}; no extractable text`)
      continue
    }

    for (let index = 0; index < chunks.length; index += 1) {
      await withRetry(
        () => store.upsert(chunks[index], {
          source: file,
          chunkIndex: index,
          chunkCount: chunks.length,
          category: 'medical_knowledge',
        }),
        maxRetries,
        `${file} chunk ${index + 1}/${chunks.length}`,
      )
      result.chunksUpserted += 1
      await wait(delayMs)
    }

    result.filesProcessed += 1
    log(
      `[ingest-medical-pdf] completed ${file}: ${chunks.length} chunks in ${Date.now() - startedAt}ms`,
    )
  }

  return result
}
