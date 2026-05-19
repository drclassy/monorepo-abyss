// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import { buildPdfKnowledgeDatabaseRecord } from '../src/knowledge/pdf-knowledge-record'
import type { KnowledgeSourceRegistryEntry } from '../src/registry/registry-types'

function makeRegistryEntry(
  overrides: Partial<KnowledgeSourceRegistryEntry> = {}
): KnowledgeSourceRegistryEntry {
  return {
    source_hash: 'source-hash-abc',
    document_id: 'document-123',
    document_title: 'Clinical Protocol',
    document_version: '2.0',
    document_type: 'digital_pdf',
    parser_provider: 'liteparse',
    page_count: 10,
    chunk_count: 3,
    quality_status: 'ready',
    registry_status: 'approved_for_embedding',
    created_at: '2026-05-20T00:00:00.000Z',
    registered_at: '2026-05-20T00:00:00.000Z',
    artifact_paths: {},
    warnings: [],
    ...overrides,
  }
}

describe('buildPdfKnowledgeDatabaseRecord', () => {
  it('maps parsed PDF chunks into database-ready knowledge records', () => {
    const record = buildPdfKnowledgeDatabaseRecord({
      source: makeRegistryEntry(),
      chunk: {
        content: 'Knowledge chunk from PDF page.',
        metadata: {
          source_hash: 'source-hash-abc',
          page_number: 7,
          parser_provider: 'liteparse',
          ocr_confidence: 0.96,
          document_version: '2.0',
          document_title: 'Clinical Protocol',
          ingestion_status: 'ready',
        },
      },
      chunkIndex: 2,
      embeddingModel: 'nomic-embed-text',
      embeddingDimensions: 768,
      embeddedAt: '2026-05-20T01:00:00.000Z',
    })

    expect(record.vectorId).toBe('kb:source-hash-abc:v2.0:p007:c0003')
    expect(record.chunkId).toBe('source-hash-abc:p007:c0003')
    expect(record.content).toBe('Knowledge chunk from PDF page.')
    expect(record.metadata).toMatchObject({
      source_hash: 'source-hash-abc',
      document_id: 'document-123',
      document_version: '2.0',
      document_title: 'Clinical Protocol',
      document_type: 'digital_pdf',
      chunk_id: 'source-hash-abc:p007:c0003',
      vector_id: 'kb:source-hash-abc:v2.0:p007:c0003',
      page_number: 7,
      parser_provider: 'liteparse',
      ocr_confidence: 0.96,
      registry_status: 'approved_for_embedding',
      ingestion_status: 'ready',
    })
    expect(record.embeddedChunk).toMatchObject({
      source_hash: 'source-hash-abc',
      document_version: '2.0',
      chunk_id: 'source-hash-abc:p007:c0003',
      vector_id: 'kb:source-hash-abc:v2.0:p007:c0003',
      page_number: 7,
      parser_provider: 'liteparse',
      ocr_confidence: 0.96,
      registry_status: 'approved_for_embedding',
      embedding_model: 'nomic-embed-text',
      embedding_dimension: 768,
      embedded_at: '2026-05-20T01:00:00.000Z',
    })
    expect(record.metadata.content_hash).toBe(record.embeddedChunk.content_hash)
  })

  it('uses registry metadata when chunk metadata is incomplete', () => {
    const record = buildPdfKnowledgeDatabaseRecord({
      source: makeRegistryEntry({ parser_provider: 'liteparse', quality_status: 'needs_review' }),
      chunk: {
        content: 'Chunk with sparse metadata.',
        metadata: {
          source_hash: 'source-hash-abc',
        },
      },
      chunkIndex: 0,
      embeddingModel: 'nomic-embed-text',
      embeddingDimensions: 768,
      embeddedAt: '2026-05-20T01:00:00.000Z',
    })

    expect(record.vectorId).toBe('kb:source-hash-abc:v2.0:p000:c0001')
    expect(record.metadata).toMatchObject({
      page_number: 0,
      parser_provider: 'liteparse',
      ocr_confidence: null,
      ingestion_status: 'needs_review',
    })
    expect(record.embeddedChunk.page_number).toBe(0)
    expect(record.embeddedChunk.ocr_confidence).toBeNull()
  })

  it('keeps vector IDs stable for repeated PDF knowledge records', () => {
    const params = {
      source: makeRegistryEntry(),
      chunk: {
        content: 'Stable PDF knowledge chunk.',
        metadata: {
          source_hash: 'source-hash-abc',
          page_number: 3,
          parser_provider: 'liteparse',
          ocr_confidence: null,
        },
      },
      chunkIndex: 4,
      embeddingModel: 'nomic-embed-text',
      embeddingDimensions: 768,
      embeddedAt: '2026-05-20T01:00:00.000Z',
    }

    const first = buildPdfKnowledgeDatabaseRecord(params)
    const second = buildPdfKnowledgeDatabaseRecord(params)

    expect(second.vectorId).toBe(first.vectorId)
    expect(second.chunkId).toBe(first.chunkId)
    expect(second.embeddedChunk.content_hash).toBe(first.embeddedChunk.content_hash)
  })
})
