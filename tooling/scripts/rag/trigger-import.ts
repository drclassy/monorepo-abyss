import { spawnSync } from 'node:child_process'
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
  // Script ini sengaja sederhana: ia memanggil uploader resmi di packages/vertex-rag.
  // Jalankan dari root:
  //   pnpm dlx tsx tooling/scripts/rag/trigger-import.ts

  const repoRoot = findRepoRoot()
  const script = path.join(repoRoot, 'packages/vertex-rag/src/official-uploader.ts')
  const args = ['--dir', repoRoot, 'dlx', 'tsx', script]

  console.log('--- Trigger Import (Vertex RAG) ---')
  console.log(`cmd: pnpm ${args.join(' ')}`)

  const result = spawnSync('pnpm', args, {
    stdio: 'inherit',
    shell: false,
  })

  process.exit(result.status ?? 1)
}

main()
