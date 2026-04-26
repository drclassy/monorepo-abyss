import * as fs from 'fs'
import * as path from 'path'
import type { KnowledgeRegistry } from './registry-types'

export async function writeKnowledgeRegistry(params: {
  registryDir: string
  registry: KnowledgeRegistry
}): Promise<string> {
  const { registryDir, registry } = params

  fs.mkdirSync(registryDir, { recursive: true })

  const sorted: KnowledgeRegistry = {
    ...registry,
    updated_at: new Date().toISOString(),
    entries: [...registry.entries].sort((a, b) => a.source_hash.localeCompare(b.source_hash)),
  }

  const registryPath = path.join(registryDir, 'registry.json')
  fs.writeFileSync(registryPath, JSON.stringify(sorted, null, 2), 'utf8')

  return registryPath
}

export function writeRegistryExport(
  registryDir: string,
  filename: string,
  data: unknown
): string {
  fs.mkdirSync(registryDir, { recursive: true })
  const filePath = path.join(registryDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  return filePath
}
