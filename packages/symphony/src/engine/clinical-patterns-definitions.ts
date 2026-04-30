// Designed and constructed by Classy.
/**
 * clinical-patterns-definitions — SYMPHONY native 70-CP registry.
 *
 * Phase 3 of the SYMPHONY canonicalization migration. DRY approach: the 70 CP
 * definitions are derived at module load time from ASSIST_PATTERN_PARITY_DEFINITIONS
 * via toSymphonyPattern(). No data duplication. Gate mapping now resolves to the
 * canonical SymphonySafetyGate union after Phase 5 taxonomy reconciliation.
 */

import type { SymphonyClinicalPattern, SymphonyCriterion } from '@the-abyss/shared-types'

import {
  ASSIST_PATTERN_PARITY_DEFINITIONS,
  mapAssistPatternParityGateToSymphonySafetyGate,
  type AssistPatternParityDefinition,
} from '../adapters/assist-patterns-parity'

// ---------------------------------------------------------------------------
// Converter: AssistPatternParityDefinition → SymphonyClinicalPattern
// ---------------------------------------------------------------------------

function toSymphonyPattern(def: AssistPatternParityDefinition): SymphonyClinicalPattern {
  return {
    id: def.id,
    gate: mapAssistPatternParityGateToSymphonySafetyGate(def.gate),
    severity: def.severity,
    tier: def.tier,
    title: def.title,
    reasoning: def.reasoning,
    requiredCriteria: def.criteria.required as unknown as SymphonyCriterion[],
    scoredCriteria:
      def.criteria.scored.length > 0
        ? (def.criteria.scored as unknown as SymphonyCriterion[])
        : undefined,
    minScore: def.criteria.minScore,
    recommendations: def.recommendations as string[],
    actionProtocolId: def.actionProtocolId,
    requiresVitals:
      def.requiresVitals && def.requiresVitals.length > 0
        ? (def.requiresVitals as string[])
        : undefined,
    source: def.source,
    differentials: def.differentials as string[] | undefined,
    supersededBy: def.supersededBy as string[] | undefined,
    confidenceWeight: def.confidenceWeight,
  }
}

// ---------------------------------------------------------------------------
// Registry — 70 SYMPHONY clinical patterns derived from adapter definitions
// ---------------------------------------------------------------------------

export const SYMPHONY_CLINICAL_PATTERNS: readonly SymphonyClinicalPattern[] =
  ASSIST_PATTERN_PARITY_DEFINITIONS.map(toSymphonyPattern)
