// Designed and constructed by Classy.
/**
 * pattern-engine — integration tests for the SYMPHONY generic pattern evaluator.
 *
 * Three synthetic non-clinical fixtures (engineer-invented, not from the 70 CP
 * registry — those are Phase 3). Each fixture ≤ 20 lines. Tests verify
 * end-to-end evaluation with realistic multi-criterion patterns.
 *
 * FIXTURE_ALPHA — required-only, tier A, severity critical → confidence 0.9
 * FIXTURE_BETA  — scored-only (3 criteria, minScore=2, 2 pass), tier A → ~0.84
 * FIXTURE_GAMMA — required + scored + requiresVitals + tier C + weight=0.5 → 0.25
 */

import { describe, expect, it } from 'vitest'

import { evaluateSymphonyPatterns } from '../index'
import type { SymphonyClinicalPattern, SymphonyClinicalSnapshot } from '../index'

// ---------------------------------------------------------------------------
// Shared snapshot — satisfies all three fixtures simultaneously
// ---------------------------------------------------------------------------

const INTEGRATION_SNAPSHOT: SymphonyClinicalSnapshot = {
  vitals: { sbp: 120, dbp: 80, hr: 105, rr: 24, temp: 36.5, spo2: 94, glucose: 100 },
  derived: {
    map: 93,
    shockIndex: 0.875,
    avpuLevel: 'A',
    htnSeverity: 'normal',
    glucoseCategory: 'normal',
    hasHypotension: false,
    pulsePressure: 40,
  },
  symptoms: { signals: [], negatedSignals: [] },
  history: {
    bpHistory: [],
    knownHTN: false,
    knownDM: false,
    knownAsthma: false,
    knownCOPD: false,
    pregnancyStatus: null,
    allergies: [],
    chronicDiseases: [],
  },
  patient: { age: 40, physiology: 'adult', avpuManual: 'A', supplementalO2: false, painScore: 0 },
  timestamp: Date.now(),
}

// ---------------------------------------------------------------------------
// FIXTURE_ALPHA — required-only pattern, tier A, severity critical
// Expected confidence: 0.9 (base tier A, no weight, no scored criteria)
// ---------------------------------------------------------------------------

const FIXTURE_ALPHA: SymphonyClinicalPattern = {
  id: 'ALPHA-001',
  gate: 'GATE_5_SEPSIS',
  severity: 'critical',
  tier: 'A',
  title: 'Alpha test pattern',
  reasoning: 'RR high and HR high — synthetic fixture',
  requiredCriteria: [
    { field: 'vitals.rr', op: 'gte', value: 20, label: 'RR >= 20' },
    { field: 'vitals.hr', op: 'gte', value: 100, label: 'HR >= 100' },
  ],
  recommendations: ['Fixture only'],
  source: 'integration-test',
}

// ---------------------------------------------------------------------------
// FIXTURE_BETA — scored-only pattern, tier A, severity high, minScore=2
// 3 scored criteria; snapshot satisfies 2 of 3 (rr+hr pass, sbp<100 fails)
// Expected confidence: 0.9 × (0.8 + 0.2 × 2/3) ≈ 0.84
// ---------------------------------------------------------------------------

const FIXTURE_BETA: SymphonyClinicalPattern = {
  id: 'BETA-001',
  gate: 'GATE_6_RESPIRATORY',
  severity: 'high',
  tier: 'A',
  title: 'Beta test pattern',
  reasoning: '2 of 3 scored criteria — synthetic fixture',
  requiredCriteria: [],
  scoredCriteria: [
    { field: 'vitals.rr', op: 'gte', value: 22, label: 'RR >= 22' },
    { field: 'vitals.hr', op: 'gte', value: 100, label: 'HR >= 100' },
    { field: 'vitals.sbp', op: 'lt', value: 100, label: 'SBP < 100' },
  ],
  minScore: 2,
  recommendations: ['Fixture only'],
  source: 'integration-test',
}

// ---------------------------------------------------------------------------
// FIXTURE_GAMMA — required + scored + requiresVitals + tier C + weight=0.5
// requiresVitals: ['sbp', 'rr'] — both present in snapshot
// 1 required (rr>=20 ✓) + 2 scored both pass → achieved=2/2, ratio=1.0
// Expected confidence: 0.5 (tier C) × 0.5 (weight) × (0.8 + 0.2 × 1.0) = 0.25
// ---------------------------------------------------------------------------

const FIXTURE_GAMMA: SymphonyClinicalPattern = {
  id: 'GAMMA-001',
  gate: 'GATE_1_VITALS',
  severity: 'warning',
  tier: 'C',
  title: 'Gamma test pattern',
  reasoning: 'Required + scored + vitals guard — synthetic fixture',
  requiredCriteria: [{ field: 'vitals.rr', op: 'gte', value: 20, label: 'RR >= 20' }],
  scoredCriteria: [
    { field: 'vitals.hr', op: 'gte', value: 100, label: 'HR >= 100' },
    { field: 'vitals.spo2', op: 'lte', value: 95, label: 'SpO2 <= 95' },
  ],
  minScore: 1,
  requiresVitals: ['sbp', 'rr'],
  confidenceWeight: 0.5,
  recommendations: ['Fixture only'],
  source: 'integration-test',
}

// ---------------------------------------------------------------------------
// Individual fixture tests
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — integration: FIXTURE_ALPHA', () => {
  it('matches with confidence 0.9 (tier A base, no weight, no scored)', () => {
    const result = evaluateSymphonyPatterns(INTEGRATION_SNAPSHOT, [FIXTURE_ALPHA])
    expect(result).toHaveLength(1)
    expect(result[0].pattern.id).toBe('ALPHA-001')
    expect(result[0].confidence).toBeCloseTo(0.9)
    expect(result[0].matchedCriteria).toHaveLength(2)
  })
})

describe('SYMPHONY pattern engine — integration: FIXTURE_BETA', () => {
  it('matches when 2 of 3 scored criteria pass (minScore=2)', () => {
    const result = evaluateSymphonyPatterns(INTEGRATION_SNAPSHOT, [FIXTURE_BETA])
    expect(result).toHaveLength(1)
    expect(result[0].pattern.id).toBe('BETA-001')
    expect(result[0].score?.achieved).toBe(2)
    expect(result[0].score?.total).toBe(3)
  })

  it('beta confidence: 0.9 × (0.8 + 0.2 × 2/3) ≈ 0.84', () => {
    const result = evaluateSymphonyPatterns(INTEGRATION_SNAPSHOT, [FIXTURE_BETA])
    expect(result[0].confidence).toBeCloseTo(0.84, 2)
  })

  it('does not match when snapshot fails to reach minScore', () => {
    const lowSnap: SymphonyClinicalSnapshot = {
      ...INTEGRATION_SNAPSHOT,
      vitals: { sbp: 120, dbp: 80, hr: 90, rr: 18, temp: 36.5, spo2: 98, glucose: 100 },
    }
    const result = evaluateSymphonyPatterns(lowSnap, [FIXTURE_BETA])
    expect(result).toHaveLength(0)
  })
})

describe('SYMPHONY pattern engine — integration: FIXTURE_GAMMA', () => {
  it('matches when required vitals present, required criteria pass, scored ≥ minScore', () => {
    const result = evaluateSymphonyPatterns(INTEGRATION_SNAPSHOT, [FIXTURE_GAMMA])
    expect(result).toHaveLength(1)
    expect(result[0].pattern.id).toBe('GAMMA-001')
  })

  it('gamma confidence: 0.5 × 0.5 × 1.0 = 0.25', () => {
    const result = evaluateSymphonyPatterns(INTEGRATION_SNAPSHOT, [FIXTURE_GAMMA])
    expect(result[0].confidence).toBeCloseTo(0.25)
  })

  it('skips when a required vital is 0 (not entered)', () => {
    const missingVital: SymphonyClinicalSnapshot = {
      ...INTEGRATION_SNAPSHOT,
      vitals: { sbp: 0, dbp: 80, hr: 105, rr: 24, temp: 36.5, spo2: 94, glucose: 100 },
    }
    expect(evaluateSymphonyPatterns(missingVital, [FIXTURE_GAMMA])).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Multi-pattern evaluation — all three fixtures, assert severity sort order
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — integration: multi-pattern sort', () => {
  it('returns all three matches sorted critical → high → warning', () => {
    const result = evaluateSymphonyPatterns(
      INTEGRATION_SNAPSHOT,
      [FIXTURE_GAMMA, FIXTURE_BETA, FIXTURE_ALPHA]  // intentionally shuffled
    )
    expect(result).toHaveLength(3)
    expect(result[0].pattern.severity).toBe('critical')
    expect(result[1].pattern.severity).toBe('high')
    expect(result[2].pattern.severity).toBe('warning')
  })

  it('confidence ordering within each severity level is preserved', () => {
    const result = evaluateSymphonyPatterns(
      INTEGRATION_SNAPSHOT,
      [FIXTURE_GAMMA, FIXTURE_BETA, FIXTURE_ALPHA]
    )
    // critical(ALPHA, 0.9) > high(BETA, ~0.84) > warning(GAMMA, 0.25)
    expect(result[0].confidence).toBeGreaterThan(result[1].confidence)
    expect(result[1].confidence).toBeGreaterThan(result[2].confidence)
  })
})
