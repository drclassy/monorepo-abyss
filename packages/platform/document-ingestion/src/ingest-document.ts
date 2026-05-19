import { readFileSync } from 'node:fs'

import { toChunkerInput } from './chunking/chunker-adapter'
import { IngestionError } from './errors/ingestion-error'
import { createSourceHash } from './hashing/source-hash'
import { renderMarkdown } from './normalization/markdown-renderer'
import { LiteParseProvider } from './providers/liteparse.provider'
import { summarizeForLog } from './quality/ocr-quality-report'
import type { CanonicalDocument, ChunkerInput, ParseInput } from './types'

const provider = new LiteParseProvider()

/**
 * Primary ingestion entry point.
 *
 * Steps:
 * 1. Load file buffer
 * 2. Generate sourceHash (deduplication key)
 * 3. Parse via LiteParseProvider (preflight + OCR if needed)
 * 4. Return canonical JSON, markdown, and chunker-ready output
 *
 * Does NOT embed, does NOT write to vector DB.
 */
export async function ingestDocument(input: ParseInput): Promise<{
  canonical: CanonicalDocument
  markdown: string
  chunks: ChunkerInput[]
}> {
  if (!input.filePath && !input.buffer) {
    throw new IngestionError('Either filePath or buffer must be provided', 'NO_INPUT')
  }

  // Ensure buffer is loaded for hash before provider does its own read
  let buffer: Buffer
  try {
    if (input.buffer) {
      buffer = input.buffer
    } else if (input.filePath) {
      buffer = readFileSync(input.filePath)
    } else {
      throw new IngestionError('Either filePath or buffer must be provided', 'NO_INPUT')
    }
  } catch (err) {
    throw new IngestionError(
      `Cannot read file: ${input.filePath ?? '(buffer)'}`,
      'FILE_READ_ERROR',
      err
    )
  }

  const sourceHash = createSourceHash(buffer)

  // Pass buffer through so provider does not re-read
  const canonical = await provider.parse({ ...input, buffer })

  const markdown = renderMarkdown(canonical)
  const chunks = toChunkerInput(canonical)

  // Safe log — no document content, no PHI
  console.log(
    `[document-ingestion] ${summarizeForLog(canonical)} | source_hash=${sourceHash.slice(0, 12)}...`
  )

  return { canonical, markdown, chunks }
}
