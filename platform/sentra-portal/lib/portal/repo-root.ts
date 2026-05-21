import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export function getRepoRoot(): string {
  const env = process.env.PORTAL_REPO_ROOT?.trim()
  if (env) {
    return path.resolve(env)
  }

  try {
    const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()
    if (fs.existsSync(path.join(root, '.agent', 'HANDOFF.md'))) {
      return path.resolve(root)
    }
  } catch {
    // fall through
  }

  let dir = process.cwd()
  for (let i = 0; i < 8; i++) {
    const handoff = path.join(dir, '.agent', 'HANDOFF.md')
    if (fs.existsSync(handoff)) {
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  return path.resolve(process.cwd(), '../..')
}
