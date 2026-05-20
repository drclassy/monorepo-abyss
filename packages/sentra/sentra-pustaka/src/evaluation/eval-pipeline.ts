// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import path from 'path'

import { createVectorStore, DEFAULT_EMBEDDING_MODEL } from '@sentra/cermin'

import { readKnowledgeRegistry } from '../registry/registry-reader.js'

import { writeEvalArtifacts, buildEvalRunId, sanitizeEvalError } from './eval-artifacts.js'
import { scoreEvidenceQuality } from './quality-scorer.js'
import { loadEvalQueries } from './query-loader.js'
import { generateRecommendations } from './recommendations.js'
import { runEvalQuery } from './retrieval-runner.js'
import type {
  EvidenceQualityReport,
  RetrievalEvalPipelineParams,
  RetrievalEvalSummary,
  QueryEvalResult,
  FailedQuery,
} from './types.js'

const DEFAULT_TOP_K = 5
const DEFAULT_MIN_SIMILARITY = 0.5

/**
 * ABYSS-RAG-005: Retrieval Validation and Evidence Quality Evaluation Pipeline.
 *
 * Dry-run mode:
 *   - Validates registry, queries file, and embedding artifacts.
 *   - Zero vector store queries. Zero provider runtime calls.
 *   - Generates evaluation artifacts with empty/placeholder results.
 *
 * Eval mode (default):
 *   - Loads queries, runs each against vector store.
 *   - Validates traceability and approval for every retrieved chunk.
 *   - Computes AADI readiness verdict.
 *   - Generates all evaluation artifacts.
 */
export async function runRetrievalEvalPipeline(
  params: RetrievalEvalPipelineParams
): Promise<RetrievalEvalSummary> {
  const {
    registryDir,
    embeddingArtifactsDir,
    queriesPath,
    outputDir,
    writeMode,
    topK = DEFAULT_TOP_K,
    minSimilarity = DEFAULT_MIN_SIMILARITY,
    embeddingModel = DEFAULT_EMBEDDING_MODEL,
    databaseClient,
  } = params

  const runId = buildEvalRunId()
  const startedAt = new Date().toISOString()
  const registryPath = path.join(registryDir, 'registry.json')

  // 1. Load registry
  const registry = await readKnowledgeRegistry(registryDir)
  const registryEntries = registry.entries ?? []

  // 2. Load queries
  const { queries, error: queryLoadError } = loadEvalQueries(queriesPath)

  const queryResults: QueryEvalResult[] = []
  const failedQueries: FailedQuery[] = []

  if (queryLoadError) {
    failedQueries.push({
      query_id: '__load__',
      error_code: 'QUERY_LOAD_FAILED',
      message: queryLoadError,
    })
  }

  // 3. Execute queries (skip in dry-run mode)
  if (writeMode === 'eval' && queries.length > 0 && databaseClient) {
    const vectorStore = createVectorStore({
      database: databaseClient,
      embeddingModel,
    })

    for (const query of queries) {
      try {
        const result = await runEvalQuery(query, vectorStore, registryEntries, topK, minSimilarity)

        if (result.errors.length > 0 && result.results_returned === 0) {
          failedQueries.push({
            query_id: query.query_id,
            error_code: 'QUERY_EXECUTION_FAILED',
            message: result.errors.join('; '),
          })
        } else {
          queryResults.push(result)
        }
      } catch (err) {
        failedQueries.push({
          query_id: query.query_id,
          error_code: 'UNEXPECTED_FAILURE',
          message: sanitizeEvalError(err),
        })
      }
    }
  } else if (writeMode === 'eval' && !databaseClient) {
    failedQueries.push({
      query_id: '__setup__',
      error_code: 'NO_DATABASE_CLIENT',
      message: 'DATABASE_URL or database client not provided. Cannot execute vector queries.',
    })
  }

  // 4. Score quality
  const qualityReport: EvidenceQualityReport =
    writeMode === 'eval'
      ? scoreEvidenceQuality(queryResults, failedQueries.length)
      : {
          total_queries: queries.length,
          total_results: 0,
          approved_evidence: 0,
          flagged_evidence: 0,
          untraceable_evidence: 0,
          passed_queries: 0,
          failed_queries: failedQueries.length,
          avg_similarity_score: 0,
          min_similarity_score: 0,
          max_similarity_score: 0,
          traceability_completeness: 1,
          approval_rate: 0,
          aadi_readiness: 'not_ready',
          readiness_reason: 'Dry run only: no vector queries executed.',
        }

  // 5. Generate recommendations
  const recommendations =
    writeMode === 'eval'
      ? generateRecommendations(queryResults, qualityReport)
      : [
          {
            type: 'INFO' as const,
            message: 'DRY_RUN: No vector queries executed. Results are structural placeholders only.',
            action: 'Run with writeMode=eval and a database client to generate retrieval quality metrics.',
          },
        ]

  // 6. Build summary
  const completedAt = new Date().toISOString()

  const status =
    failedQueries.length === 0
      ? 'completed'
      : queryResults.length === 0
        ? 'failed'
        : 'completed_with_failures'

  const summary: RetrievalEvalSummary = {
    retrieval_eval_run_id: runId,
    started_at: startedAt,
    completed_at: completedAt,
    registry_path: path.relative(process.cwd(), registryPath),
    embedding_artifacts_path: path.relative(process.cwd(), embeddingArtifactsDir),
    queries_path: path.relative(process.cwd(), queriesPath),
    total_queries: queries.length,
    passed_queries: queryResults.filter((r) => r.passed_threshold).length,
    failed_queries: failedQueries.length,
    avg_similarity: qualityReport.avg_similarity_score,
    aadi_readiness: qualityReport.aadi_readiness,
    mode_disclaimer:
      writeMode !== 'eval'
        ? 'DRY_RUN: No vector queries executed. Results are structural placeholders only.'
        : null,
    write_mode: writeMode,
    status,
  }

  // 7. Write artifacts
  try {
    writeEvalArtifacts({
      outputDir,
      runId,
      summary,
      queryResults,
      qualityReport,
      failedQueries,
      recommendations,
    })
  } catch (err) {
    console.error(`[eval-retrieval] Failed to write artifacts: ${sanitizeEvalError(err)}`)
  }

  return summary
}
