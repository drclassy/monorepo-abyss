// Designed and constructed by Avvcenna+.
/**
 * clinical-patterns-definitions — SYMPHONY native 70-CP registry.
 *
 * Phase 3 of the SYMPHONY canonicalization migration. DRY approach: the 70 CP
 * definitions are derived at module load time from ASSIST_PATTERN_PARITY_DEFINITIONS
 * via toSymphonyLocalPattern(). No data duplication. Gate mapping is package-local.
 *
 * Decision 2 (Chief GO 2026-04-22): Three Assist gates have no SymphonySafetyGate
 * analog. They use internal SymphonyLocalGate values (GATE_11_ACS, GATE_12_STROKE,
 * GATE_13_ANEMIA_BLEED). Phase 5 owns taxonomy reconciliation.
 */

import type { SymphonyClinicalPattern, SymphonyCriterion, SymphonySafetyGate } from '@the-abyss/shared-types'
import {
  ASSIST_PATTERN_PARITY_DEFINITIONS,
  type AssistPatternParityDefinition,
  type AssistPatternParityGate,
} from '../adapters/assist-patterns-parity'

// ---------------------------------------------------------------------------
// Internal gate union — NEVER exported from this package
// Phase 5 will reconcile GATE_11_ACS / GATE_12_STROKE / GATE_13_ANEMIA_BLEED
// into SymphonySafetyGate in @the-abyss/shared-types.
// ---------------------------------------------------------------------------

type SymphonyLocalGate =
  | SymphonySafetyGate
  | 'GATE_11_ACS'
  | 'GATE_12_STROKE'
  | 'GATE_13_ANEMIA_BLEED'

// ---------------------------------------------------------------------------
// Internal pattern type — gate is wider than SymphonySafetyGate
// NEVER export SymphonyLocalGate or SymphonyLocalClinicalPattern outside
// the symphony package. Consumers use SymphonyClinicalPattern.
// ---------------------------------------------------------------------------

export interface SymphonyLocalClinicalPattern extends Omit<SymphonyClinicalPattern, 'gate'> {
  readonly gate: SymphonyLocalGate
}

// ---------------------------------------------------------------------------
// Gate mapping: Assist gate → SYMPHONY local gate
// ---------------------------------------------------------------------------

const GATE_MAP: Record<AssistPatternParityGate, SymphonyLocalGate> = {
  GATE_SEPSIS_EARLY: 'GATE_5_SEPSIS',
  GATE_SEPTIC_SHOCK_HIGH: 'GATE_5_SEPSIS',
  GATE_SHOCK_INDEX: 'GATE_4_OCCULT_SHOCK',
  GATE_RESP_FAILURE: 'GATE_6_RESPIRATORY',
  GATE_RESP_ASTHMA_COPD: 'GATE_6_RESPIRATORY',
  GATE_PE_SUSPECT: 'GATE_9_PE',
  GATE_ANAPHYLAXIS: 'GATE_10_ANAPHYLAXIS',
  GATE_DKA_HHS: 'GATE_3_GLUCOSE',
  GATE_ACS: 'GATE_11_ACS',
  GATE_STROKE: 'GATE_12_STROKE',
  GATE_ANEMIA_BLEED_CHRONIC: 'GATE_13_ANEMIA_BLEED',
}

// ---------------------------------------------------------------------------
// Converter: AssistPatternParityDefinition → SymphonyLocalClinicalPattern
// ---------------------------------------------------------------------------

function toSymphonyLocalPattern(def: AssistPatternParityDefinition): SymphonyLocalClinicalPattern {
  return {
    id: def.id,
    gate: GATE_MAP[def.gate],
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

export const SYMPHONY_CLINICAL_PATTERNS: readonly SymphonyLocalClinicalPattern[] =
  ASSIST_PATTERN_PARITY_DEFINITIONS.map(toSymphonyLocalPattern)
