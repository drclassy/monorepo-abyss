// Designed and constructed by Avvcenna+.
/**
 * pattern-types — internal type definitions for the SYMPHONY generic pattern
 * evaluator. These are engine-internal; consumers import only the public
 * contracts exported from packages/shared-types (SymphonyClinicalSnapshot,
 * SymphonyPatternMatch added in Phase 2 commit 9).
 *
 * Phase 2 of the SYMPHONY canonicalization migration (closes Gap #6 in the
 * 2026-04-20 coverage audit).
 */

import type { SymphonySafetyGate } from '@the-abyss/shared-types'

import type { SymphonySymptomSignalResult } from '../engine/symptom-signals'

// ---------------------------------------------------------------------------
// Criterion operator — 10 operators (FEATURE.md §737 + 'in' from Assist source)
// Source citation: pattern-types.ts:20-30, pattern-engine.ts:106-109
// ---------------------------------------------------------------------------

export type SymphonyCriterionOp =
  | 'gte'     // field >= value (numeric)
  | 'lte'     // field <= value (numeric)
  | 'gt'      // field > value (numeric)
  | 'lt'      // field < value (numeric)
  | 'eq'      // field === value (strict)
  | 'neq'     // field !== value (strict)
  | 'between' // field >= min && field <= max (numeric, inclusive)
  | 'true'    // field === true
  | 'false'   // field === false
  | 'in'      // value.split(',').includes(String(field))

// ---------------------------------------------------------------------------
// Criterion — a single testable condition
// ---------------------------------------------------------------------------

export interface SymphonyCriterion {
  /** Dot-path into SymphonyClinicalSnapshot, e.g. 'vitals.rr', 'symptoms.chestPain' */
  field: string
  op: SymphonyCriterionOp
  /** Threshold: [min,max] for 'between'; CSV string for 'in'; primitive otherwise */
  value: number | string | boolean | [number, number]
  label?: string
}

// ---------------------------------------------------------------------------
// Pattern tier
// ---------------------------------------------------------------------------

/** Implementation priority tier (A = vitals-only, B = +keywords, C = structured inputs) */
export type SymphonyPatternTier = 'A' | 'B' | 'C'

// ---------------------------------------------------------------------------
// Pattern severity (3-level: no 'info' in clinical pattern evaluation)
// ---------------------------------------------------------------------------

export type SymphonyPatternSeverity = 'critical' | 'high' | 'warning'

// ---------------------------------------------------------------------------
// ScoreResult — output of scored-criteria evaluation
// ---------------------------------------------------------------------------

export interface SymphonyScoreResult {
  achieved: number
  required: number
  total: number
}

// ---------------------------------------------------------------------------
// ClinicalPattern — internal pattern definition (70 CP data is Phase 3)
// ---------------------------------------------------------------------------

export interface SymphonyClinicalPattern {
  id: string
  gate: SymphonySafetyGate
  severity: SymphonyPatternSeverity
  tier: SymphonyPatternTier
  title: string
  reasoning: string
  requiredCriteria: SymphonyCriterion[]
  scoredCriteria?: SymphonyCriterion[]
  /** Defaults to scoredCriteria.length when not set */
  minScore?: number
  recommendations: string[]
  actionProtocolId?: string
  supersededBy?: string[]
  /** Vitals that must be > 0 for this pattern to evaluate */
  requiresVitals?: string[]
  source: string
  differentials?: string[]
  /** Confidence multiplier: 1.0 = full, 0.5 = keyword-dependent */
  confidenceWeight?: number
}

// ---------------------------------------------------------------------------
// PatternMatch — output of evaluateSymphonyPatterns (one matched pattern)
// ---------------------------------------------------------------------------

export interface SymphonyPatternMatch {
  pattern: SymphonyClinicalPattern
  matchedCriteria: SymphonyCriterion[]
  score?: SymphonyScoreResult
  confidence: number
  actionProtocolId?: string
}

// ---------------------------------------------------------------------------
// ClinicalSnapshot — input to the pattern evaluator
// Ported 1:1 from Assist's ClinicalSnapshot; Assist-only imports replaced.
// Source citation: clinical-snapshot.ts (full shape)
// ---------------------------------------------------------------------------

export type SymphonyAvpuLevel = 'A' | 'V' | 'P' | 'U'
export type SymphonyHtnSeverity = 'normal' | 'prehypertension' | 'stage1' | 'stage2' | 'crisis'
export type SymphonyGlucoseCategory =
  | 'hypoglycemic'
  | 'normal'
  | 'prediabetic'
  | 'diabetic'
  | 'severe_hyperglycemia'
export type SymphonyPhysiologyBand =
  | 'infant'
  | 'toddler'
  | 'child'
  | 'adolescent'
  | 'adult'
  | 'elderly'
  | 'geriatric'

export interface SymphonyParsedVitals {
  sbp: number
  dbp: number
  hr: number
  rr: number
  temp: number
  spo2: number
  /** 0 = not entered (sentinel, per Assist parseVital convention) */
  glucose: number
}

export interface SymphonyHistoricalBP {
  sbp: number
  dbp: number
  timestamp: number
}

export interface SymphonyDerivedValues {
  map: number | undefined
  shockIndex: number | undefined
  avpuLevel: SymphonyAvpuLevel
  htnSeverity: SymphonyHtnSeverity | undefined
  glucoseCategory: SymphonyGlucoseCategory | undefined
  hasHypotension: boolean
  pulsePressure: number | undefined
}

export interface SymphonyClinicalHistory {
  bpHistory: SymphonyHistoricalBP[]
  knownHTN: boolean
  knownDM: boolean
  knownAsthma: boolean
  knownCOPD: boolean
  pregnancyStatus: boolean | null
  allergies: string[]
  chronicDiseases: string[]
}

export interface SymphonySnapshotPatient {
  age: number
  physiology: SymphonyPhysiologyBand
  /** Raw AVPU from form; 'C' (Confused) maps to 'V' for clinical evaluation */
  avpuManual: 'A' | 'C' | 'V' | 'P' | 'U'
  supplementalO2: boolean
  painScore: number
}

export interface SymphonyClinicalSnapshot {
  vitals: SymphonyParsedVitals
  derived: SymphonyDerivedValues
  symptoms: SymphonySymptomSignalResult
  history: SymphonyClinicalHistory
  patient: SymphonySnapshotPatient
  timestamp: number
}
