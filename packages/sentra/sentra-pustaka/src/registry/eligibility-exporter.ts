// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { KnowledgeRegistry, KnowledgeSourceRegistryEntry } from './registry-types'

export function createEligibleForEmbeddingExport(
  registry: KnowledgeRegistry
): KnowledgeSourceRegistryEntry[] {
  return registry.entries.filter(
    (entry) =>
      entry.registry_status === 'approved_for_embedding' &&
      entry.quality_status !== 'failed' &&
      entry.artifact_paths.chunks_path !== undefined &&
      entry.artifact_paths.chunks_path !== null
  )
}
