// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import * as dotenv from 'dotenv'
import { GemmaEngine } from './assessment/gemma.js'
import { GuardEngine } from './compliance/guard.js'
import { PgVectorStore } from './storage/pgvector.store.js'
import { OllamaEmbedder } from './ingestion/embedder.js'
import { LocalBrainEngine } from './retrieval/local.engine.js'
import { HybridBrainEngine } from './retrieval/hybrid.engine.js'
import type { RAGQueryResult, SentraRAGConfig, MedicalCategory } from './types.js'

dotenv.config()

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
  private store: PgVectorStore

  constructor(config: SentraRAGConfig = {}) {
    const ollamaUrl = config.ollamaBaseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
    const genModel  = config.generationModel ?? process.env.SENTRA_GEN_MODEL ?? 'gemma3:12b'
    const embedModel = config.embeddingModel ?? process.env.SENTRA_EMBED_MODEL ?? 'nomic-embed-text'

    this.store      = new PgVectorStore(config.pgConnectionString)
    this.assessment = new GemmaEngine(ollamaUrl, genModel)
    this.guard      = new GuardEngine()

    const embedder  = new OllamaEmbedder(embedModel, ollamaUrl)
    const local     = new LocalBrainEngine(this.store, embedder)
    this.brain      = new HybridBrainEngine(local, config.similarityThreshold ?? 2)
  }

  async ask(question: string, _category?: MedicalCategory): Promise<RAGQueryResult> {
    const cleanQuestion = this.guard.sanitize(question)
    this.guard.audit(`Query: ${cleanQuestion.substring(0, 50)}...`)

    let context = ''
    let source: 'local' = 'local'
    const chunks: RAGQueryResult['chunks'] = []

    try {
      const brainResult = await this.brain.search(cleanQuestion, 5)
      source = brainResult.source

      const local: LocalBrainEngine = (this.brain as any).local
      const localCtx = local.formatContext(brainResult.chunks)
      context = localCtx

      chunks.push(...brainResult.chunks)
    } catch (err) {
      console.warn('[SentraRAG] Brain search failed:', err)
      context = 'Referensi tidak tersedia.'
    }

    try {
      const answer = await this.assessment.think(cleanQuestion, context)
      return { answer, chunks, source, model: `${(this.assessment as any).model} via Sentra RAG Engine`, status: 'SUCCESS', timestamp: new Date().toISOString() }
    } catch (err) {
      return { answer: 'Gagal mendapatkan jawaban dari model.', chunks, source, model: 'gemma3:12b', status: 'ERROR', error: String(err), timestamp: new Date().toISOString() }
    }
  }

  async initialize(): Promise<void> {
    await this.store.initialize()
  }

  async stats() {
    return this.store.stats()
  }

  async close(): Promise<void> {
    await this.store.close()
  }
}
