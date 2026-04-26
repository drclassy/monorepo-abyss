import * as fs from 'fs'
import * as path from 'path'

export interface DiscoverPdfOptions {
  limit?: number
}

function collectPdfs(dir: string, results: string[]): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectPdfs(fullPath, results)
    } else if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
      results.push(fullPath)
    }
  }
}

export async function discoverPdfFiles(
  inputDir: string,
  options: DiscoverPdfOptions = {}
): Promise<string[]> {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory not found: ${inputDir}`)
  }

  const results: string[] = []
  collectPdfs(inputDir, results)

  results.sort()

  if (options.limit !== undefined && options.limit > 0) {
    return results.slice(0, options.limit)
  }

  return results
}
