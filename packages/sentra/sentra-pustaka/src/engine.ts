// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { createVectorStore } from '@sentra/cermin'
import * as dotenv from 'dotenv'
import { Pool } from 'pg'

import { GemmaEngine } from './assessment/gemma.js'
import { attachGroundedCitations } from './citation/query-result.js'
import { GuardEngine } from './compliance/guard.js'
import { PgPoolVectorAdapter } from './embedding/pg-adapter.js'
import { HybridBrainEngine } from './retrieval/hybrid.engine.js'
import { LocalBrainEngine } from './retrieval/local.engine.js'
import type { RAGQueryResult, SentraRAGConfig, MedicalCategory } from './types.js'

dotenv.config()

function getLocalBrainEngine(brain: HybridBrainEngine): LocalBrainEngine | null {
  const local = Reflect.get(brain, 'local') as unknown
  return local instanceof LocalBrainEngine ? local : null
}

function getAssessmentModelName(assessment: GemmaEngine): string {
  const model = Reflect.get(assessment, 'model')
  return typeof model === 'string' && model.length > 0 ? model : 'gemma3:12b'
}

/**
 * Sentra RAG Engine
 *
 * Architecture A-B-C (local-first):
 *  [A] Assessment  — GemmaEngine  (Ollama: gemma3:12b)
 *  [B] Brain       — HybridBrain  (pgvector local only)
 *  [C] Compliance  — GuardEngine  (PHI/PII sanitization)
 */
export class SentraRAGEngine {
  private assessment: GemmaEngine
  private brain: HybridBrainEngine
  private guard: GuardEngine
  private pool: Pool
  private localVectorStore: ReturnType<typeof createVectorStore>

  constructor(config: SentraRAGConfig = {}) {
    const ollamaUrl =
      config.ollamaBaseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
    const genModel = config.generationModel ?? process.env.SENTRA_GEN_MODEL ?? 'gemma3:12b'
    const embedModel = config.embeddingModel ?? process.env.SENTRA_EMBED_MODEL ?? 'nomic-embed-text'

    this.assessment = new GemmaEngine(ollamaUrl, genModel)
    this.guard = new GuardEngine()
    this.pool = new Pool({
      connectionString: config.pgConnectionString ?? process.env.DATABASE_URL,
    })

    const databaseClient = new PgPoolVectorAdapter(this.pool)
    this.localVectorStore = createVectorStore({
      database: databaseClient,
      embeddingModel: embedModel,
      ollamaBaseUrl: ollamaUrl,
    })

    const local = new LocalBrainEngine(this.localVectorStore)
    this.brain = new HybridBrainEngine(local, config.similarityThreshold ?? 2)
  }

  async ask(question: string, _category?: MedicalCategory): Promise<RAGQueryResult> {
    const cleanQuestion = this.guard.sanitize(question)
    this.guard.audit(`Query: ${cleanQuestion.substring(0, 50)}...`)

    let context = ''
    let source: RAGQueryResult['source'] = 'local'
    const chunks: RAGQueryResult['chunks'] = []

    try {
      const brainResult = await this.brain.search(cleanQuestion, 5)
      source = brainResult.source

      const local = getLocalBrainEngine(this.brain)
      if (local) {
        context = local.formatContext(brainResult.chunks)
      }

      chunks.push(...brainResult.chunks)
    } catch (err) {
      console.warn('[SentraRAG] Brain search failed:', err)
      context = 'Referensi tidak tersedia.'
    }

    try {
      const answer = await this.assessment.think(cleanQuestion, context)
      return attachGroundedCitations({
        answer,
        chunks,
        source,
        model: `${getAssessmentModelName(this.assessment)} via Sentra RAG Engine`,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      return attachGroundedCitations({
        answer: 'Gagal mendapatkan jawaban dari model.',
        chunks,
        source,
        model: 'gemma3:12b',
        status: 'ERROR',
        error: String(err),
        timestamp: new Date().toISOString(),
      })
    }
  }

  async initialize(): Promise<void> {
    await this.localVectorStore.ensureSchema()
  }

  async stats() {
    const total = await this.pool.query(`SELECT COUNT(*) FROM "KnowledgeBase"`)
    return {
      total: parseInt(total.rows[0].count, 10),
      byCategory: {},
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}
