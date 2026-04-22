// Designed and constructed by Avvcenna+.
/**
 * clinical-patterns — SYMPHONY native clinical patterns evaluator.
 *
 * Phase 3 of the SYMPHONY canonicalization migration. Evaluates the 70 CP
 * rules natively against a SymphonyClinicalSnapshot (Phase 2 contract) and
 * returns SymphonyAlert[] — no Assist runtime participation.
 *
 * Consumers building SymphonyClinicalSnapshot must populate boolean symptom
 * flags on the symptoms object (e.g. symptoms.suspectedInfection = true) for
 * Tier B/C patterns to fire. Tier A patterns (vitals only) work without flags.
 *
 * evaluateSymphonyPatterns is generic over SymphonyEvaluablePattern so the
 * local gate strings (GATE_11–13) are handled without any cast.
 */

import type { SymphonyClinicalSnapshot, SymphonyEvaluablePattern, SymphonyAlert } from '@the-abyss/shared-types'

import { evaluateSymphonyPatterns, type SymphonyPatternEvaluationOptions, type SymphonyPatternMatch } from './pattern-engine'
import { SYMPHONY_CLINICAL_PATTERNS } from './clinical-patterns-definitions'

export { SYMPHONY_CLINICAL_PATTERNS }

// ---------------------------------------------------------------------------
// Alert converter
// ---------------------------------------------------------------------------

export function clinicalPatternMatchToSymphonyAlert(
  match: SymphonyPatternMatch<SymphonyEvaluablePattern>,
  triggeredAt?: string
): SymphonyAlert {
  const pat = match.pattern
  return {
    id: `assist-${pat.id.toLowerCase()}`,
    severity: pat.severity,
    title: pat.title,
    reasoning: [pat.reasoning],
    source: 'pattern',
    acknowledged: false,
    triggeredAt: triggeredAt ?? new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Main evaluator
// ---------------------------------------------------------------------------

/**
 * Evaluate 70 SYMPHONY clinical patterns against a clinical snapshot.
 *
 * @param snapshot    Pre-built SymphonyClinicalSnapshot (consumer responsibility)
 * @param options     Optional tier filter (SymphonyPatternEvaluationOptions)
 * @param triggeredAt ISO 8601 timestamp for all emitted alerts (defaults to now)
 * @returns           SymphonyAlert[] sorted by severity (critical first), confidence descending
 */
export function evaluateClinicalPatterns(
  snapshot: SymphonyClinicalSnapshot,
  options?: SymphonyPatternEvaluationOptions,
  triggeredAt?: string
): SymphonyAlert[] {
  const matches = evaluateSymphonyPatterns(
    snapshot,
    SYMPHONY_CLINICAL_PATTERNS,
    options
  )
  return matches.map(match => clinicalPatternMatchToSymphonyAlert(match, triggeredAt))
}
