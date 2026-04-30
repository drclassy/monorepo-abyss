// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import * as path from 'path'
import { runPdfDryRunIngestion } from '../ingestion/pdf-batch-runner'

function parseArgs(argv: string[]): {
  input?: string
  output?: string
  force: boolean
  limit?: number
} {
  let input: string | undefined
  let output: string | undefined
  let force = false
  let limit: number | undefined

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--input' && argv[i + 1]) {
      input = argv[++i]
    } else if (argv[i] === '--output' && argv[i + 1]) {
      output = argv[++i]
    } else if (argv[i] === '--force') {
      force = true
    } else if (argv[i] === '--limit' && argv[i + 1]) {
      limit = parseInt(argv[++i], 10)
    }
  }

  return { input, output, force, limit }
}

function printUsage(): void {
  console.log(`
Usage:
  pnpm sentra-rag ingest:pdf --input <dir> --output <dir> [--force] [--limit <n>]

Options:
  --input   Path to folder containing PDF files (recursive)
  --output  Path to output knowledge artifacts folder
  --force   Reprocess documents that were already processed
  --limit   Maximum number of PDFs to process
`)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  if (!args.input || !args.output) {
    printUsage()
    process.exit(1)
  }

  const inputDir = path.resolve(args.input)
  const outputDir = path.resolve(args.output)

  console.log('ABYSS-RAG-002 PDF Dry-Run Ingestion')
  console.log(`Input:  ${inputDir}`)
  console.log(`Output: ${outputDir}`)

  const summary = await runPdfDryRunIngestion({
    inputDir,
    outputDir,
    force: args.force,
    limit: args.limit,
  })

  console.log(`Discovered PDFs:    ${summary.totalDiscoveredPdfs}`)
  console.log(`Processed:          ${summary.processedCount}`)
  console.log(`Ready:              ${summary.readyCount}`)
  console.log(`Needs Review:       ${summary.needsReviewCount}`)
  console.log(`Failed:             ${summary.failedCount}`)
  console.log(`Skipped Duplicates: ${summary.skippedDuplicateCount}`)
  console.log(`Summary:            ${outputDir}/ingestion-summary.json`)
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
