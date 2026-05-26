import { existsSync } from 'node:fs'
import * as path from 'node:path'

function findRepoRoot(): string {
  let current = process.cwd()

  while (true) {
    if (existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current
    }

    const parent = path.dirname(current)
    if (parent === current) {
      throw new Error('Cannot locate repo root from current working directory.')
    }
    current = parent
  }
}

function main(): void {
  // Script ini sengaja sederhana: ia kini hanya menjadi penanda bahwa jalur RAG lama
  // sudah diputus dan workflow import harus lewat stack lokal.
  // Jalankan dari root:
  //   pnpm dlx tsx tooling/scripts/rag/trigger-import.ts
  void findRepoRoot()
  console.log('--- Trigger Import (Local RAG) ---')
  console.log(
    'Jalur RAG lama sudah dinonaktifkan. Gunakan packages/sentra-rag untuk ingest/query lokal.'
  )
  process.exit(0)
}

main()
