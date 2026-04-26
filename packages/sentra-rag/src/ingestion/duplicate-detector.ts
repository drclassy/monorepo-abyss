import * as fs from 'fs'
import * as path from 'path'

export function isDuplicate(
  outputDir: string,
  sourceHash: string,
  force?: boolean
): boolean {
  if (!sourceHash) return false
  const artifactDir = path.join(outputDir, 'processed', sourceHash)
  return fs.existsSync(artifactDir) && !force
}
