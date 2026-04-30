// Designed and constructed by Classy.
/**
 * pattern-types — internal type definitions for the SYMPHONY generic pattern
 * evaluator. These are engine-internal; consumers import only the public
 * contracts exported from packages/shared-types (SymphonyClinicalSnapshot,
 * SymphonyPatternMatch added in Phase 2 commit 9).
 *
 * Phase 2 of the SYMPHONY canonicalization migration (closes Gap #6 in the
 * 2026-04-20 coverage audit).
 */

// All Phase 2 types promoted to @the-abyss/shared-types in commit 9.
// This file re-exports them for any internal symphony consumers that
// imported from this path before the promotion.
export type {
  SymphonyAvpuLevel,
  SymphonyClinicalHistory,
  SymphonyClinicalPattern,
  SymphonyClinicalSnapshot,
  SymphonyCriterion,
  SymphonyCriterionOp,
  SymphonyDerivedValues,
  SymphonyGlucoseCategory,
  SymphonyHistoricalBP,
  SymphonyHtnSeverity,
  SymphonyParsedVitals,
  SymphonyPatternMatch,
  SymphonyPatternSeverity,
  SymphonyPatternTier,
  SymphonyPhysiologyBand,
  SymphonyScoreResult,
  SymphonySnapshotPatient,
} from '@the-abyss/shared-types'
