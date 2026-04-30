// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { execFile } from 'child_process'
import { promisify } from 'util'
import * as dotenv from 'dotenv'
import { chunkText } from './chunker.js'
import { OllamaEmbedder } from './embedder.js'
import { PgVectorStore } from '../storage/pgvector.store.js'
import type { IngestionResult, MedicalCategory } from '../types.js'

dotenv.config()

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PDF_EXTRACT_PY = path.join(__dirname, 'pdf_extract.py')

const LIBRARY_PATH = process.env.MEDICAL_LIBRARY_PATH
  || path.join(process.cwd(), '../../library/medical')

const VALID_CATEGORIES: MedicalCategory[] = ['gen', 'int', 'pha', 'ped', 'obg', 'bas']

async function extractPdf(filePath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync('python', [PDF_EXTRACT_PY, filePath], {
      maxBuffer: 50 * 1024 * 1024,
    })
    return stdout
  } catch (err: any) {
    const msg = err?.stderr || String(err)
    throw new Error(`PDF extraction failed for ${path.basename(filePath)}: ${msg}`)
  }
}

function detectCategory(filename: string): MedicalCategory {
  const prefix = filename.split('--')[0].toLowerCase()
  return VALID_CATEGORIES.includes(prefix as MedicalCategory)
    ? (prefix as MedicalCategory)
    : 'gen'
}

export async function ingestFile(
  filePath: string,
  store: PgVectorStore,
  embedder: OllamaEmbedder
): Promise<IngestionResult> {
  const filename = path.basename(filePath)
  const cat = detectCategory(filename)
  const sourceFile = `library/medical/${cat}/${filename}`

  if (await store.fileExists(sourceFile)) {
    return { file: filename, chunks: 0, embedded: 0, stored: 0, skipped: true }
  }

  let text: string
  try {
    text = await extractPdf(filePath)
  } catch (err) {
    return { file: filename, chunks: 0, embedded: 0, stored: 0, skipped: false, error: String(err) }
  }

  const chunks = chunkText(text)
  let stored = 0

  for (const chunk of chunks) {
    try {
      const embedding = await embedder.embed(chunk.content)
      await store.upsert({
        sourceFile,
        category: cat,
        chunkIndex: chunk.index,
        headingPath: chunk.headingPath,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        embedding,
      })
      stored++
    } catch {
      // continue on individual chunk failure
    }
  }

  return { file: filename, chunks: chunks.length, embedded: chunks.length, stored, skipped: false }
}

export async function ingestLibrary(options: {
  libraryPath?: string
  categories?: MedicalCategory[]
  limit?: number
} = {}): Promise<void> {
  const libPath = options.libraryPath || LIBRARY_PATH
  const store = new PgVectorStore()
  const embedder = new OllamaEmbedder()

  console.log('Sentra RAG Engine — Medical Library Ingestion')
  console.log(`Library: ${libPath}`)

  if (!fs.existsSync(libPath)) {
    throw new Error(`Library path not found: ${libPath}`)
  }

  const available = await embedder.isAvailable()
  if (!available) {
    throw new Error('Ollama not reachable or nomic-embed-text not pulled. Run: ollama pull nomic-embed-text')
  }

  await store.initialize()

  // Files are in category subdirectories: library/medical/pha/pha--xxx.pdf
  const selectedCats = options.categories ?? VALID_CATEGORIES
  const allFiles: Array<{ filename: string; filePath: string }> = []

  for (const cat of selectedCats) {
    const subdir = path.join(libPath, cat)
    if (!fs.existsSync(subdir)) continue
    const pdfs = fs.readdirSync(subdir).filter(f => f.endsWith('.pdf'))
    for (const f of pdfs) {
      allFiles.push({ filename: f, filePath: path.join(subdir, f) })
    }
  }

  const files = options.limit ? allFiles.slice(0, options.limit) : allFiles
  console.log(`Processing ${files.length} PDF files...\n`)

  let skipped = 0, failed = 0, total = 0

  for (const [i, { filename, filePath }] of files.entries()) {
    process.stdout.write(`[${i + 1}/${files.length}] ${filename.substring(0, 55)}... `)
    const result = await ingestFile(filePath, store, embedder)

    if (result.skipped) {
      skipped++
      console.log('SKIP (already indexed)')
    } else if (result.error) {
      failed++
      console.log(`ERROR: ${result.error}`)
    } else {
      total += result.stored
      console.log(`OK (${result.chunks} chunks, ${result.stored} stored)`)
    }
  }

  const stats = await store.stats()
  console.log(`\nDone. Total chunks in DB: ${stats.total}`)
  console.log('By category:', stats.byCategory)
  console.log(`This run — stored: ${total} | skipped: ${skipped} | failed: ${failed}`)

  await store.close()
}

// CLI entry
if (process.argv[1] && process.argv[1].includes('pipeline')) {
  const categories = process.argv.includes('--pha') ? ['pha' as MedicalCategory]
    : process.argv.includes('--gen') ? ['gen' as MedicalCategory]
    : process.argv.includes('--int') ? ['int' as MedicalCategory]
    : process.argv.includes('--ped') ? ['ped' as MedicalCategory]
    : process.argv.includes('--obg') ? ['obg' as MedicalCategory]
    : process.argv.includes('--bas') ? ['bas' as MedicalCategory]
    : undefined

  ingestLibrary({ categories }).catch(console.error)
}
