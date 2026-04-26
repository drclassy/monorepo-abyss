import { randomUUID } from 'crypto'
import type { KnowledgeRegistry, RegistrySummary } from './registry-types'

export function buildRegistrySummary(
  registry: KnowledgeRegistry,
  startedAt: string
): RegistrySummary {
  const counts = {
    ready_for_review: 0,
    approved_for_embedding: 0,
    needs_review: 0,
    failed: 0,
    superseded: 0,
    archived: 0,
  }

  for (const entry of registry.entries) {
    if (entry.registry_status in counts) {
      counts[entry.registry_status]++
    }
  }

  return {
    run_id: randomUUID(),
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    total_entries: registry.entries.length,
    ready_for_review_count: counts.ready_for_review,
    approved_for_embedding_count: counts.approved_for_embedding,
    needs_review_count: counts.needs_review,
    failed_count: counts.failed,
    superseded_count: counts.superseded,
    archived_count: counts.archived,
  }
}
