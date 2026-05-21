// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
export type KnowledgeSourceStatus =
  | 'ready_for_review'
  | 'approved_for_embedding'
  | 'needs_review'
  | 'failed'
  | 'superseded'
  | 'archived'

export type QualityStatus = 'ready' | 'needs_review' | 'failed'

export interface KnowledgeSourceRegistryEntry {
  source_hash: string
  document_id: string
  document_title?: string
  document_version: string
  document_type?: string
  parser_provider: string
  page_count: number
  chunk_count: number
  quality_status: QualityStatus
  registry_status: KnowledgeSourceStatus
  created_at: string
  registered_at: string
  artifact_paths: {
    canonical_path?: string
    markdown_path?: string
    chunks_path?: string
    quality_report_path?: string
  }
  warnings: string[]
  supersedes?: string[]
  superseded_by?: string
}

export interface KnowledgeRegistry {
  schema_version: '1.0.0'
  updated_at: string
  entries: KnowledgeSourceRegistryEntry[]
}

export interface RegistrySummary {
  run_id: string
  started_at: string
  completed_at: string
  total_entries: number
  ready_for_review_count: number
  approved_for_embedding_count: number
  needs_review_count: number
  failed_count: number
  superseded_count: number
  archived_count: number
}

export function mapQualityToRegistryStatus(quality: QualityStatus): KnowledgeSourceStatus {
  switch (quality) {
    case 'ready':
      return 'ready_for_review'
    case 'needs_review':
      return 'needs_review'
    case 'failed':
      return 'failed'
  }
}
