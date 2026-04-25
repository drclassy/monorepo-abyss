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
  // Script ini sengaja sederhana: ia memanggil package vertex-rag melalui workspace graph.
  // Jalankan dari root:
  //   pnpm dlx tsx tooling/scripts/rag/trigger-import.ts

  const repoRoot = findRepoRoot()
  const args = ['--dir', repoRoot, '--filter', '@the-abyss/vertex-rag', 'exec', 'tsx', 'src/official-uploader.ts']

  console.log('--- Trigger Import (Vertex RAG) ---')
  console.log(`cmd: pnpm ${args.join(' ')}`)

  const result = spawnSync('pnpm', args, {
    stdio: 'inherit',
    shell: false,
  })

  process.exit(result.status ?? 1)
}

main()
