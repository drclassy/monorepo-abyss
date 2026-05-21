// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import * as fs from 'fs'
import * as path from 'path'

import type { KnowledgeRegistry } from './registry-types'

const EMPTY_REGISTRY: KnowledgeRegistry = {
  schema_version: '1.0.0',
  updated_at: new Date().toISOString(),
  entries: [],
}

export async function readKnowledgeRegistry(registryDir: string): Promise<KnowledgeRegistry> {
  const registryPath = path.join(registryDir, 'registry.json')

  if (!fs.existsSync(registryPath)) {
    return { ...EMPTY_REGISTRY, updated_at: new Date().toISOString() }
  }

  try {
    const raw = fs.readFileSync(registryPath, 'utf8')
    const parsed = JSON.parse(raw) as KnowledgeRegistry

    if (!parsed.schema_version || !Array.isArray(parsed.entries)) {
      return { ...EMPTY_REGISTRY, updated_at: new Date().toISOString() }
    }

    return parsed
  } catch {
    return { ...EMPTY_REGISTRY, updated_at: new Date().toISOString() }
  }
}
