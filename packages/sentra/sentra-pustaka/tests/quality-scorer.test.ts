import { describe, it, expect } from 'vitest'

import {
  computeRankingMetrics,
  scoreEvidenceQuality,
} from '../src/evaluation/quality-scorer'
import type { QueryEvalResult } from '../src/evaluation/types'

function makePassedResult(queryId: string, approvedCount = 3): QueryEvalResult {
  const evidence = Array.from({ length: approvedCount }, (_, i) => ({
    vector_id: `kb:hash:v1:p001:c${String(i + 1).padStart(4, '0')}`,
    source_hash: 'goodhash',
    document_version: 'v1',
    page_number: 1,
    parser_provider: 'liteparse',
    ocr_confidence: 0.95,
    registry_status_at_write: 'approved_for_embedding',
    current_registry_status: 'approved_for_embedding',
    similarity_score: 0.85,
    is_traceable: true,
    is_approved: true,
    traceability_issues: [],
  }))

  return {
    query_id: queryId,
    query_text_prefix: `Query ${queryId}…`,
    top_k_requested: 5,
    results_returned: approvedCount,
    approved_results: approvedCount,
    flagged_results: 0,
    untraceable_results: 0,
    avg_similarity: 0.85,
    max_similarity: 0.9,
    min_similarity: 0.8,
    passed_threshold: true,
    evidence,
    errors: [],
    evaluated_at: new Date().toISOString(),
  }
}

describe('scoreEvidenceQuality', () => {
  it('returns not_ready with readiness_reason when no queries evaluated', () => {
    const report = scoreEvidenceQuality([], 0)
    expect(report.aadi_readiness).toBe('not_ready')
    expect(report.total_queries).toBe(0)
  })

  it('returns ready when all queries pass with approved evidence', () => {
    const results = [
      makePassedResult('q001'),
      makePassedResult('q002'),
      makePassedResult('q003'),
      makePassedResult('q004'),
      makePassedResult('q005'),
    ]
    const report = scoreEvidenceQuality(results, 0)

    expect(report.aadi_readiness).toBe('ready')
    expect(report.approval_rate).toBe(1)
    expect(report.traceability_completeness).toBe(1)
    expect(report.passed_queries).toBe(5)
  })

  it('computes correct aggregate counts', () => {
    const results = [makePassedResult('q001', 3), makePassedResult('q002', 2)]
    const report = scoreEvidenceQuality(results, 0)

    expect(report.total_results).toBe(5)
    expect(report.approved_evidence).toBe(5)
    expect(report.flagged_evidence).toBe(0)
  })

  it('returns not_ready when unapproved evidence present', () => {
    const result = makePassedResult('q001')
    result.evidence[0].is_approved = false
    result.evidence[0].current_registry_status = 'superseded'

    const report = scoreEvidenceQuality([result], 0)

    expect(report.aadi_readiness).toBe('not_ready')
    expect(report.approval_rate).toBeLessThan(1)
  })

  it('returns needs_review when pass rate is 50-79%', () => {
    // 1 passed, 1 not passed (but no approval/traceability issues)
    const passed = makePassedResult('q001')
    // not failed query — it returned results but none passed threshold
    const lowSimilarity: QueryEvalResult = {
      ...makePassedResult('q002', 1),
      passed_threshold: false,
      avg_similarity: 0.3,
      evidence: [
        {
          vector_id: 'kb:x:v1:p001:c0001',
          source_hash: 'goodhash',
          document_version: 'v1',
          page_number: 1,
          parser_provider: 'liteparse',
          ocr_confidence: 0.9,
          registry_status_at_write: 'approved_for_embedding',
          current_registry_status: 'approved_for_embedding',
          similarity_score: 0.3,
          is_traceable: true,
          is_approved: true,
          traceability_issues: [],
        },
      ],
    }

    const report = scoreEvidenceQuality([passed, lowSimilarity], 0)
    // 50% pass rate (1/2), all approved and traceable
    expect(report.aadi_readiness).toBe('needs_review')
  })

  it('includes failed query count in total', () => {
    const results = [makePassedResult('q001')]
    const report = scoreEvidenceQuality(results, 2)

    expect(report.total_queries).toBe(3)
    expect(report.failed_queries).toBe(2)
  })
})

const makeRankingResult = (isApproved: boolean[]) => ({
  query_id: 'q1',
  results: isApproved.map((approved, rank) => ({
    vector_id: `v${rank}`,
    is_approved: approved,
    rank: rank + 1,
    score: 1 - rank * 0.1,
  })),
})

describe('computeRankingMetrics', () => {
  it('computes MRR=1.0 when first result is approved', () => {
    const metrics = computeRankingMetrics([makeRankingResult([true, false, false])])
    expect(metrics.mrr).toBeCloseTo(1)
  })

  it('computes MRR=0.5 when second result is first approved', () => {
    const metrics = computeRankingMetrics([makeRankingResult([false, true, false])])
    expect(metrics.mrr).toBeCloseTo(0.5)
  })

  it('computes MRR=0 when no approved result exists', () => {
    const metrics = computeRankingMetrics([makeRankingResult([false, false, false])])
    expect(metrics.mrr).toBeCloseTo(0)
  })

  it('computes Recall@1 and Recall@5', () => {
    const metrics = computeRankingMetrics([makeRankingResult([true, false, false, false, false])])
    expect(metrics.recallAtK['recall@1']).toBeCloseTo(1)
    expect(metrics.recallAtK['recall@5']).toBeCloseTo(1)
  })

  it('averages MRR across multiple queries', () => {
    const metrics = computeRankingMetrics([
      makeRankingResult([true, false]),
      makeRankingResult([false, true]),
    ])
    expect(metrics.mrr).toBeCloseTo(0.75)
  })

  it('computes MAP across multiple relevant results', () => {
    const metrics = computeRankingMetrics([makeRankingResult([true, false, true])])
    expect(metrics.map).toBeCloseTo((1 + 2 / 3) / 2)
  })
})
