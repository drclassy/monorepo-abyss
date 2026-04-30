// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { KnowledgeRegistry } from './registry-types'

export function markSuperseded(params: {
  registry: KnowledgeRegistry
  oldSourceHash: string
  newSourceHash: string
}): KnowledgeRegistry {
  const { registry, oldSourceHash, newSourceHash } = params

  const entries = registry.entries.map((entry) => {
    if (entry.source_hash === oldSourceHash) {
      return { ...entry, registry_status: 'superseded' as const, superseded_by: newSourceHash }
    }
    if (entry.source_hash === newSourceHash) {
      const existing = entry.supersedes ?? []
      return {
        ...entry,
        supersedes: existing.includes(oldSourceHash) ? existing : [...existing, oldSourceHash],
      }
    }
    return entry
  })

  return { ...registry, entries }
}
