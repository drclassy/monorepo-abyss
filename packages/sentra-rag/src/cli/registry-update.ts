// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import * as path from 'path'
import * as fs from 'fs'
import { updateKnowledgeRegistry } from '../registry/knowledge-registry'
import { readKnowledgeRegistry } from '../registry/registry-reader'

function parseArgs(argv: string[]): {
  artifacts?: string
  registry?: string
  force: boolean
  list: boolean
} {
  let artifacts: string | undefined
  let registry: string | undefined
  let force = false
  let list = false

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--artifacts' && argv[i + 1]) {
      artifacts = argv[++i]
    } else if (argv[i] === '--registry' && argv[i + 1]) {
      registry = argv[++i]
    } else if (argv[i] === '--force') {
      force = true
    } else if (argv[i] === 'list' || argv[i] === '--list') {
      list = true
    }
  }

  return { artifacts, registry, force, list }
}

function printUsage(): void {
  console.log(`
Usage:
  pnpm sentra-rag registry:update --artifacts <dir> --registry <dir> [--force]
  pnpm sentra-rag registry:list   --registry <dir>

Commands:
  registry:update   Read ABYSS-RAG-002 artifacts and update knowledge registry
  registry:list     List registry entries and counts

Options:
  --artifacts   Path to knowledge-artifacts folder (output of ingest:pdf)
  --registry    Path to knowledge-registry folder (output of registry:update)
  --force       Reprocess existing approved entries
`)
}

async function runUpdate(artifactsDir: string, registryDir: string, force: boolean): Promise<void> {
  console.log('ABYSS-RAG-003 Knowledge Source Registry Update')
  console.log(`Artifacts: ${artifactsDir}`)
  console.log(`Registry:  ${registryDir}`)

  const summary = await updateKnowledgeRegistry({ artifactsDir, registryDir, force })

  console.log(`Total Entries:            ${summary.total_entries}`)
  console.log(`Ready for Review:         ${summary.ready_for_review_count}`)
  console.log(`Approved for Embedding:   ${summary.approved_for_embedding_count}`)
  console.log(`Needs Review:             ${summary.needs_review_count}`)
  console.log(`Failed:                   ${summary.failed_count}`)
  console.log(`Superseded:               ${summary.superseded_count}`)
  console.log(`Archived:                 ${summary.archived_count}`)
  console.log(`Registry:                 ${path.join(registryDir, 'registry.json')}`)
}

async function runList(registryDir: string): Promise<void> {
  const registryPath = path.join(registryDir, 'registry.json')
  if (!fs.existsSync(registryPath)) {
    console.log(`No registry found at: ${registryPath}`)
    return
  }

  const registry = await readKnowledgeRegistry(registryDir)
  console.log(`Knowledge Registry — ${registry.entries.length} entries`)
  console.log(`Updated: ${registry.updated_at}`)
  console.log('')

  for (const entry of registry.entries) {
    const title = entry.document_title ?? entry.source_hash.slice(0, 12) + '...'
    console.log(`  [${entry.registry_status.padEnd(22)}]  ${title}`)
  }
}

async function main(): Promise<void> {
  const isListCommand = process.argv[2] === 'list'
  const argv = isListCommand ? process.argv.slice(3) : process.argv.slice(2)
  const args = parseArgs(argv)

  if (isListCommand || args.list) {
    if (!args.registry) {
      printUsage()
      process.exit(1)
    }
    await runList(path.resolve(args.registry))
    return
  }

  if (!args.artifacts || !args.registry) {
    printUsage()
    process.exit(1)
  }

  await runUpdate(path.resolve(args.artifacts), path.resolve(args.registry), args.force)
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
