// Designed and constructed by Avvcenna+.
/**
 * pattern-engine — unit test suite for the SYMPHONY generic pattern evaluator.
 *
 * Phase 2 of the SYMPHONY canonicalization migration (closes Gap #6 in the
 * 2026-04-20 coverage audit). Pure TS, zero runtime deps.
 *
 * TDD: tests written before implementation, watched to fail first.
 */

import { describe, expect, it } from 'vitest'

import { evaluateSymphonyPatterns } from '../index'
import type {
  SymphonyClinicalPattern,
  SymphonyClinicalSnapshot,
  SymphonyPatternMatch,
} from '../index'

// ---------------------------------------------------------------------------
// Minimal snapshot factory — used across all unit tests
// ---------------------------------------------------------------------------

function makeSnapshot(overrides?: Partial<SymphonyClinicalSnapshot>): SymphonyClinicalSnapshot {
  const base: SymphonyClinicalSnapshot = {
    vitals: { sbp: 120, dbp: 80, hr: 80, rr: 16, temp: 36.5, spo2: 98, glucose: 100 },
    derived: {
      map: 93,
      shockIndex: 0.67,
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
  return { ...base, ...overrides }
}

// ---------------------------------------------------------------------------
// Minimal pattern factory
// ---------------------------------------------------------------------------

function makePattern(overrides?: Partial<SymphonyClinicalPattern>): SymphonyClinicalPattern {
  const base: SymphonyClinicalPattern = {
    id: 'TEST-001',
    gate: 'GATE_1_VITALS',
    severity: 'warning',
    tier: 'A',
    title: 'Test Pattern',
    reasoning: 'Test reasoning',
    requiredCriteria: [],
    recommendations: ['Test recommendation'],
    source: 'test',
  }
  return { ...base, ...overrides }
}

// ---------------------------------------------------------------------------
// 1. Types scaffold — evaluateSymphonyPatterns callable, returns array
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — scaffold', () => {
  it('evaluateSymphonyPatterns returns empty array when no patterns provided', () => {
    const result: SymphonyPatternMatch[] = evaluateSymphonyPatterns(makeSnapshot(), [])
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(0)
  })

  it('evaluateSymphonyPatterns returns empty array when pattern has no criteria', () => {
    const pattern = makePattern({ requiredCriteria: [] })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [pattern])
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
    expect(result[0].pattern.id).toBe('TEST-001')
  })
})

// ---------------------------------------------------------------------------
// 2. Dot-path field resolver
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — field resolver', () => {
  it('resolves top-level field via criterion (vitals.sbp)', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'vitals.sbp', op: 'gte', value: 100, label: 'SBP >= 100' }],
    })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [pattern])
    expect(result).toHaveLength(1)
  })

  it('resolves nested 2-deep field (derived.shockIndex)', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'derived.shockIndex', op: 'lte', value: 1.0, label: 'SI <= 1.0' }],
    })
    const snap = makeSnapshot()
    snap.derived.shockIndex = 0.67
    const result = evaluateSymphonyPatterns(snap, [pattern])
    expect(result).toHaveLength(1)
  })

  it('returns false for missing path (no match)', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'nonexistent.field', op: 'gte', value: 0, label: 'missing' }],
    })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [pattern])
    expect(result).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 3. Derived value helpers
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — derived value resolution', () => {
  it('resolves shockIndex = hr / sbp from snapshot derived field', () => {
    const snap = makeSnapshot()
    snap.vitals.hr = 100
    snap.vitals.sbp = 100
    snap.derived.shockIndex = 1.0  // pre-computed by caller
    const pattern = makePattern({
      requiredCriteria: [{ field: 'derived.shockIndex', op: 'gte', value: 1.0, label: 'SI >= 1.0' }],
    })
    const result = evaluateSymphonyPatterns(snap, [pattern])
    expect(result).toHaveLength(1)
  })

  it('resolves MAP from snapshot derived field', () => {
    const snap = makeSnapshot()
    snap.derived.map = 93  // (120 + 2*80) / 3 = 93.33 → 93
    const pattern = makePattern({
      requiredCriteria: [{ field: 'derived.map', op: 'gte', value: 70, label: 'MAP >= 70' }],
    })
    const result = evaluateSymphonyPatterns(snap, [pattern])
    expect(result).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// 4. Criterion evaluator — 10 operators
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — criterion operators', () => {
  it('op:gte passes when field >= value', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'vitals.rr', op: 'gte', value: 16, label: 'RR >= 16' }],
    })
    expect(evaluateSymphonyPatterns(makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 80, rr: 16, temp: 36.5, spo2: 98, glucose: 100 } }), [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 80, rr: 15, temp: 36.5, spo2: 98, glucose: 100 } }), [pattern])).toHaveLength(0)
  })

  it('op:lte passes when field <= value', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'vitals.spo2', op: 'lte', value: 94, label: 'SpO2 <= 94' }],
    })
    expect(evaluateSymphonyPatterns(makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 80, rr: 16, temp: 36.5, spo2: 94, glucose: 100 } }), [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 80, rr: 16, temp: 36.5, spo2: 95, glucose: 100 } }), [pattern])).toHaveLength(0)
  })

  it('op:gt passes when field > value', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'vitals.hr', op: 'gt', value: 100, label: 'HR > 100' }],
    })
    expect(evaluateSymphonyPatterns(makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 101, rr: 16, temp: 36.5, spo2: 98, glucose: 100 } }), [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 100, rr: 16, temp: 36.5, spo2: 98, glucose: 100 } }), [pattern])).toHaveLength(0)
  })

  it('op:lt passes when field < value', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'vitals.sbp', op: 'lt', value: 90, label: 'SBP < 90' }],
    })
    expect(evaluateSymphonyPatterns(makeSnapshot({ vitals: { sbp: 89, dbp: 60, hr: 80, rr: 16, temp: 36.5, spo2: 98, glucose: 100 } }), [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(makeSnapshot({ vitals: { sbp: 90, dbp: 60, hr: 80, rr: 16, temp: 36.5, spo2: 98, glucose: 100 } }), [pattern])).toHaveLength(0)
  })

  it('op:eq passes on strict equality', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'derived.avpuLevel', op: 'eq', value: 'U', label: 'AVPU = U' }],
    })
    const snapU = makeSnapshot()
    snapU.derived.avpuLevel = 'U'
    const snapA = makeSnapshot()
    expect(evaluateSymphonyPatterns(snapU, [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(snapA, [pattern])).toHaveLength(0)
  })

  it('op:neq passes when field !== value', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'derived.avpuLevel', op: 'neq', value: 'A', label: 'AVPU != A' }],
    })
    const snapU = makeSnapshot()
    snapU.derived.avpuLevel = 'U'
    const snapA = makeSnapshot()
    expect(evaluateSymphonyPatterns(snapU, [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(snapA, [pattern])).toHaveLength(0)
  })

  it('op:true passes when field === true', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'history.knownHTN', op: 'true', value: true, label: 'Known HTN' }],
    })
    const snapYes = makeSnapshot()
    snapYes.history.knownHTN = true
    const snapNo = makeSnapshot()
    expect(evaluateSymphonyPatterns(snapYes, [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(snapNo, [pattern])).toHaveLength(0)
  })

  it('op:false passes when field === false', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'history.knownDM', op: 'false', value: false, label: 'No DM' }],
    })
    const snapNoDM = makeSnapshot()  // knownDM = false by default
    const snapDM = makeSnapshot()
    snapDM.history.knownDM = true
    expect(evaluateSymphonyPatterns(snapNoDM, [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(snapDM, [pattern])).toHaveLength(0)
  })

  it('op:between passes when min <= field <= max (inclusive)', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'derived.shockIndex', op: 'between', value: [0.9, 1.2], label: 'SI 0.9-1.2' }],
    })
    const snapIn = makeSnapshot()
    snapIn.derived.shockIndex = 1.0
    const snapOut = makeSnapshot()
    snapOut.derived.shockIndex = 0.67
    expect(evaluateSymphonyPatterns(snapIn, [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(snapOut, [pattern])).toHaveLength(0)
  })

  it('op:in passes when field value is in comma-separated list', () => {
    const pattern = makePattern({
      requiredCriteria: [{ field: 'derived.avpuLevel', op: 'in', value: 'V,P,U', label: 'AVPU impaired' }],
    })
    const snapV = makeSnapshot()
    snapV.derived.avpuLevel = 'V'
    const snapA = makeSnapshot()
    expect(evaluateSymphonyPatterns(snapV, [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(snapA, [pattern])).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 5. Required criteria AND logic + Scored criteria OR-count
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — criteria logic', () => {
  it('ALL required criteria must pass (AND)', () => {
    const pattern = makePattern({
      requiredCriteria: [
        { field: 'vitals.rr', op: 'gte', value: 22, label: 'RR >= 22' },
        { field: 'vitals.hr', op: 'gte', value: 100, label: 'HR >= 100' },
      ],
    })
    const snapBoth = makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 110, rr: 24, temp: 36.5, spo2: 98, glucose: 100 } })
    const snapOne = makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 90, rr: 24, temp: 36.5, spo2: 98, glucose: 100 } })
    expect(evaluateSymphonyPatterns(snapBoth, [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(snapOne, [pattern])).toHaveLength(0)
  })

  it('scored criteria: achieved >= minScore → match', () => {
    const pattern = makePattern({
      requiredCriteria: [],
      scoredCriteria: [
        { field: 'vitals.rr', op: 'gte', value: 22, label: 'RR high' },
        { field: 'vitals.hr', op: 'gte', value: 100, label: 'HR high' },
        { field: 'vitals.sbp', op: 'lt', value: 100, label: 'SBP low' },
      ],
      minScore: 2,
    })
    // 2 of 3 pass → match
    const snap2of3 = makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 110, rr: 24, temp: 36.5, spo2: 98, glucose: 100 } })
    expect(evaluateSymphonyPatterns(snap2of3, [pattern])).toHaveLength(1)
    // 1 of 3 pass → no match
    const snap1of3 = makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 90, rr: 24, temp: 36.5, spo2: 98, glucose: 100 } })
    expect(evaluateSymphonyPatterns(snap1of3, [pattern])).toHaveLength(0)
  })

  it('scored criteria: minScore defaults to total when not specified', () => {
    const pattern = makePattern({
      requiredCriteria: [],
      scoredCriteria: [
        { field: 'vitals.rr', op: 'gte', value: 22, label: 'RR high' },
        { field: 'vitals.hr', op: 'gte', value: 100, label: 'HR high' },
      ],
      // minScore not set → defaults to 2 (all must pass)
    })
    const snapAll = makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 110, rr: 24, temp: 36.5, spo2: 98, glucose: 100 } })
    const snapOne = makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 90, rr: 24, temp: 36.5, spo2: 98, glucose: 100 } })
    expect(evaluateSymphonyPatterns(snapAll, [pattern])).toHaveLength(1)
    expect(evaluateSymphonyPatterns(snapOne, [pattern])).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 6. Tier filter + requiresVitals guard
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — tier filter', () => {
  it('tierFilter excludes patterns not in filter list', () => {
    const patternA = makePattern({ id: 'A-001', tier: 'A' })
    const patternC = makePattern({ id: 'C-001', tier: 'C' })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [patternA, patternC], { tierFilter: ['A'] })
    expect(result).toHaveLength(1)
    expect(result[0].pattern.id).toBe('A-001')
  })

  it('no tierFilter evaluates all tiers', () => {
    const patternA = makePattern({ id: 'A-001', tier: 'A' })
    const patternC = makePattern({ id: 'C-001', tier: 'C' })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [patternA, patternC])
    expect(result).toHaveLength(2)
  })
})

describe('SYMPHONY pattern engine — requiresVitals guard', () => {
  it('skips pattern when required vital is 0 (not entered)', () => {
    const pattern = makePattern({
      requiresVitals: ['sbp', 'hr'],
    })
    const snapMissing = makeSnapshot({ vitals: { sbp: 0, dbp: 80, hr: 80, rr: 16, temp: 36.5, spo2: 98, glucose: 100 } })
    expect(evaluateSymphonyPatterns(snapMissing, [pattern])).toHaveLength(0)
  })

  it('evaluates pattern when all required vitals are present (> 0)', () => {
    const pattern = makePattern({
      requiresVitals: ['sbp', 'hr'],
    })
    const snapPresent = makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 80, rr: 16, temp: 36.5, spo2: 98, glucose: 100 } })
    expect(evaluateSymphonyPatterns(snapPresent, [pattern])).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// 7. Confidence calculation + severity sort
// ---------------------------------------------------------------------------

describe('SYMPHONY pattern engine — confidence', () => {
  it('tier A base confidence is 0.9 with no weight', () => {
    const pattern = makePattern({ tier: 'A', confidenceWeight: undefined })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [pattern])
    expect(result[0].confidence).toBeCloseTo(0.9)
  })

  it('confidence is multiplied by confidenceWeight', () => {
    const pattern = makePattern({ tier: 'A', confidenceWeight: 0.5 })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [pattern])
    expect(result[0].confidence).toBeCloseTo(0.45)
  })

  it('scored boost: ratio 1.0 applies 1.0x multiplier', () => {
    const pattern = makePattern({
      tier: 'A',
      confidenceWeight: undefined,
      requiredCriteria: [],
      scoredCriteria: [
        { field: 'vitals.rr', op: 'gte', value: 20, label: 'RR high' },
        { field: 'vitals.hr', op: 'gte', value: 90, label: 'HR high' },
      ],
      minScore: 2,
    })
    const snap = makeSnapshot({ vitals: { sbp: 120, dbp: 80, hr: 100, rr: 22, temp: 36.5, spo2: 98, glucose: 100 } })
    const result = evaluateSymphonyPatterns(snap, [pattern])
    // base=0.9, weight=1.0, ratio=2/2=1.0, multiplier=0.8+0.2*1.0=1.0, final=0.9
    expect(result[0].confidence).toBeCloseTo(0.9)
  })

  it('confidence is clamped to [0.0, 1.0]', () => {
    const pattern = makePattern({ tier: 'A', confidenceWeight: 2.0 })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [pattern])
    expect(result[0].confidence).toBeLessThanOrEqual(1.0)
    expect(result[0].confidence).toBeGreaterThanOrEqual(0.0)
  })
})

describe('SYMPHONY pattern engine — severity sort', () => {
  it('sorts critical before high before warning', () => {
    const critical = makePattern({ id: 'C', severity: 'critical' })
    const high = makePattern({ id: 'H', severity: 'high' })
    const warning = makePattern({ id: 'W', severity: 'warning' })
    const result = evaluateSymphonyPatterns(makeSnapshot(), [warning, critical, high])
    expect(result[0].pattern.severity).toBe('critical')
    expect(result[1].pattern.severity).toBe('high')
    expect(result[2].pattern.severity).toBe('warning')
  })

  it('within same severity, higher confidence comes first', () => {
    const lowConf = makePattern({ id: 'LOW', severity: 'high', tier: 'C' })  // base 0.5
    const highConf = makePattern({ id: 'HIGH', severity: 'high', tier: 'A' })  // base 0.9
    const result = evaluateSymphonyPatterns(makeSnapshot(), [lowConf, highConf])
    expect(result[0].pattern.id).toBe('HIGH')
    expect(result[1].pattern.id).toBe('LOW')
  })
})
