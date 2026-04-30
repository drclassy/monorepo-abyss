// Designed and constructed by Classy.
/**
 * pattern-engine — SYMPHONY generic clinical pattern evaluator.
 *
 * Phase 2 of the SYMPHONY canonicalization migration (closes Gap #6 in the
 * 2026-04-20 coverage audit). Pure TS, zero runtime dependencies.
 *
 * Hierarchy: SYMPHONY (parent) exposes this evaluator so Dashboard + Assist
 * consumers may evaluate clinical patterns server-side without duplicating
 * the Assist-side pattern-engine runtime.
 *
 * Fidelity: Hybrid C — FEATURE.md is the contract baseline; Assist source
 * consulted for 5 ambiguity points (operators, between semantics, missing
 * field behaviour, severity sort, input path patterns).
 *
 * Excluded (consumer responsibility):
 *   - Template resolution ({sbp}, {map}, …)
 *   - supersededBy deduplication
 *   - patternMatchesToAlerts() converter
 *   - buildSymphonyClinicalSnapshot() builder
 */

import type {
  SymphonyClinicalPattern,
  SymphonyClinicalSnapshot,
  SymphonyCriterion,
  SymphonyEvaluablePattern,
  SymphonyPatternMatch,
  SymphonyPatternSeverity,
  SymphonyPatternTier,
  SymphonyScoreResult,
} from '@the-abyss/shared-types'

// ---------------------------------------------------------------------------
// Evaluation options
// ---------------------------------------------------------------------------

export interface SymphonyPatternEvaluationOptions {
  /** Restrict evaluation to patterns in these tiers. Default: all tiers. */
  tierFilter?: SymphonyPatternTier[]
}

// ---------------------------------------------------------------------------
// Severity ordering (ascending: critical = 0)
// Source citation: pattern-engine.ts:43-47
// ---------------------------------------------------------------------------

const SEVERITY_ORDER: Record<SymphonyPatternSeverity, number> = {
  critical: 0,
  high: 1,
  warning: 2,
}

// ---------------------------------------------------------------------------
// Dot-path field resolver
// Source citation: pattern-engine.ts:61-69
// ---------------------------------------------------------------------------

function resolveField(snapshot: SymphonyClinicalSnapshot, field: string): unknown {
  const parts = field.split('.')
  let current: unknown = snapshot
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

// ---------------------------------------------------------------------------
// Criterion evaluator — 10 operators
// Source citation: pattern-engine.ts:80-113
// ---------------------------------------------------------------------------

function evaluateCriterion(snapshot: SymphonyClinicalSnapshot, criterion: SymphonyCriterion): boolean {
  const value = resolveField(snapshot, criterion.field)
  if (value === undefined || value === null) return false

  switch (criterion.op) {
    case 'gte':
      return typeof value === 'number' && value >= (criterion.value as number)
    case 'lte':
      return typeof value === 'number' && value <= (criterion.value as number)
    case 'gt':
      return typeof value === 'number' && value > (criterion.value as number)
    case 'lt':
      return typeof value === 'number' && value < (criterion.value as number)
    case 'eq':
      return value === criterion.value
    case 'neq':
      return value !== criterion.value
    case 'true':
      return value === true
    case 'false':
      return value === false
    case 'between': {
      if (typeof value !== 'number' || !Array.isArray(criterion.value)) return false
      const [min, max] = criterion.value as [number, number]
      return value >= min && value <= max
    }
    case 'in': {
      if (typeof criterion.value !== 'string') return false
      return criterion.value.split(',').includes(String(value))
    }
    default:
      return false
  }
}

// ---------------------------------------------------------------------------
// Required vitals guard
// Source citation: pattern-engine.ts:122-128
// ---------------------------------------------------------------------------

function hasRequiredVitals(snapshot: SymphonyClinicalSnapshot, pattern: SymphonyEvaluablePattern): boolean {
  if (!pattern.requiresVitals || pattern.requiresVitals.length === 0) return true
  return pattern.requiresVitals.every((field) => {
    const val = resolveField(snapshot, `vitals.${field}`)
    return typeof val === 'number' && val > 0
  })
}

// ---------------------------------------------------------------------------
// Confidence calculator
// Source citation: pattern-engine.ts:189-205
// Formula: base × weight × (0.8 + 0.2 × ratio), clamped [0.0, 1.0]
// ---------------------------------------------------------------------------

function calculateConfidence(pattern: SymphonyEvaluablePattern, score?: SymphonyScoreResult): number {
  const tierBase: Record<SymphonyPatternTier, number> = { A: 0.9, B: 0.7, C: 0.5 }
  let confidence = tierBase[pattern.tier]

  if (pattern.confidenceWeight != null) {
    confidence *= pattern.confidenceWeight
  }

  if (score && score.total > 0) {
    const ratio = score.achieved / score.total
    confidence *= 0.8 + 0.2 * ratio
  }

  return Math.min(1.0, Math.max(0.0, confidence))
}

// ---------------------------------------------------------------------------
// Main evaluation function
// ---------------------------------------------------------------------------

/**
 * Evaluate patterns against a clinical snapshot.
 *
 * @param snapshot - Pre-built SymphonyClinicalSnapshot (consumers build their own)
 * @param patterns - Pattern definitions to evaluate (70 CP definitions are Phase 3)
 * @param options  - Optional tier filter
 * @returns Matched patterns sorted by severity (critical first), confidence descending
 */
export function evaluateSymphonyPatterns<P extends SymphonyEvaluablePattern = SymphonyClinicalPattern>(
  snapshot: SymphonyClinicalSnapshot,
  patterns: readonly P[],
  options?: SymphonyPatternEvaluationOptions
): SymphonyPatternMatch<P>[] {
  const tierFilter = options?.tierFilter
  const matches: SymphonyPatternMatch<P>[] = []

  for (const pattern of patterns) {
    // 1. Tier filter
    if (tierFilter && !tierFilter.includes(pattern.tier)) continue

    // 2. Required vitals guard
    if (!hasRequiredVitals(snapshot, pattern)) continue

    // 3. Required criteria — ALL must pass (AND logic)
    const requiredResults = pattern.requiredCriteria.map((c) => ({
      criterion: c,
      passed: evaluateCriterion(snapshot, c),
    }))
    if (requiredResults.some((r) => !r.passed)) continue

    // 4. Scored criteria — achieved >= (minScore ?? total) must pass
    let scoreResult: SymphonyScoreResult | undefined
    let scoredPassed: SymphonyCriterion[] = []
    if (pattern.scoredCriteria && pattern.scoredCriteria.length > 0) {
      const scoredResults = pattern.scoredCriteria.map((c) => ({
        criterion: c,
        passed: evaluateCriterion(snapshot, c),
      }))
      const achieved = scoredResults.filter((r) => r.passed).length
      const required = pattern.minScore ?? pattern.scoredCriteria.length
      if (achieved < required) continue
      scoreResult = { achieved, required, total: pattern.scoredCriteria.length }
      scoredPassed = scoredResults.filter((r) => r.passed).map((r) => r.criterion)
    }

    // 5. Collect matched criteria for audit trail
    const matchedCriteria: SymphonyCriterion[] = [
      ...requiredResults.filter((r) => r.passed).map((r) => r.criterion),
      ...scoredPassed,
    ]

    // 6. Build SymphonyPatternMatch
    matches.push({
      pattern,
      matchedCriteria,
      score: scoreResult,
      confidence: calculateConfidence(pattern, scoreResult),
      actionProtocolId: pattern.actionProtocolId,
    })
  }

  // Sort: severity ascending (critical=0), confidence descending as tiebreak
  return matches.sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[a.pattern.severity] - SEVERITY_ORDER[b.pattern.severity]
    if (sevDiff !== 0) return sevDiff
    return b.confidence - a.confidence
  })
}
