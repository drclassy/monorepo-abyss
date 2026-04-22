// Designed and constructed by Avvcenna+.
/**
 * clinical-patterns — unit tests for Phase 3 SYMPHONY clinical patterns evaluator.
 *
 * TDD: tests written before implementation, watched to fail first.
 *
 * Tests at this level verify:
 *   - SYMPHONY_CLINICAL_PATTERNS registry has 70 entries
 *   - evaluateClinicalPatterns returns SymphonyAlert[]
 *   - CP-001 (qSOFA ≥2) fires for the correct snapshot
 *   - CP-002 (qSOFA ≥2 + suspected infection) fires with symptom flag
 *   - Normal vitals → no alerts
 *   - Alert IDs follow assist-cp-XXX format
 *   - Alert shape is complete
 */

import { describe, expect, it } from 'vitest'

import {
  SYMPHONY_ACTION_PROTOCOLS,
  getSymphonyActionProtocol,
} from '../engine/action-protocols'
import {
  SYMPHONY_CLINICAL_PATTERNS,
  evaluateClinicalPatterns,
} from '../engine/clinical-patterns'
import type { SymphonyAlert, SymphonyClinicalSnapshot } from '../index'

// ---------------------------------------------------------------------------
// Snapshot factory helpers
// ---------------------------------------------------------------------------

type SymptomFlags = Record<string, boolean>

/** Normal (healthy) snapshot — should not trigger any clinical pattern. */
function makeNormalSnapshot(): SymphonyClinicalSnapshot {
  return {
    vitals: { sbp: 120, dbp: 80, hr: 72, rr: 14, temp: 36.5, spo2: 99, glucose: 100 },
    derived: {
      map: 93,
      shockIndex: 0.6,
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
}

/**
 * Build a snapshot for qSOFA ≥2:
 *   RR=24 (≥22 ✓), SBP=95 (≤100 ✓), AVPU='A' (✗) → 2/3 = fires
 */
function makeQsofa2Snapshot(extraSymptoms?: SymptomFlags): SymphonyClinicalSnapshot {
  const base = makeNormalSnapshot()
  const symptoms = {
    ...base.symptoms,
    ...(extraSymptoms ?? {}),
  } as SymphonyClinicalSnapshot['symptoms']
  return {
    ...base,
    vitals: { ...base.vitals, rr: 24, sbp: 95 },
    patient: { ...base.patient, avpuManual: 'A' },
    symptoms,
  }
}

// ---------------------------------------------------------------------------
// 1. Registry shape
// ---------------------------------------------------------------------------

describe('SYMPHONY_CLINICAL_PATTERNS registry', () => {
  it('resolves every referenced action protocol ID', () => {
    const referenced = new Set(
      SYMPHONY_CLINICAL_PATTERNS
        .map(pattern => pattern.actionProtocolId)
        .filter((value): value is NonNullable<typeof value> => value !== undefined)
    )

    expect(SYMPHONY_ACTION_PROTOCOLS).toHaveLength(9)
    for (const protocolId of referenced) {
      expect(getSymphonyActionProtocol(protocolId)?.id).toBe(protocolId)
    }
  })

  it('contains exactly 70 patterns', () => {
    expect(SYMPHONY_CLINICAL_PATTERNS).toHaveLength(70)
  })

  it('all patterns have required fields', () => {
    for (const pattern of SYMPHONY_CLINICAL_PATTERNS) {
      expect(typeof pattern.id).toBe('string')
      expect(pattern.id).toMatch(/^CP-\d{3}$/)
      expect(['critical', 'high', 'warning']).toContain(pattern.severity)
      expect(['A', 'B', 'C']).toContain(pattern.tier)
      expect(typeof pattern.title).toBe('string')
      expect(pattern.title.length).toBeGreaterThan(0)
      expect(typeof pattern.reasoning).toBe('string')
      expect(Array.isArray(pattern.requiredCriteria)).toBe(true)
      expect(Array.isArray(pattern.recommendations)).toBe(true)
    }
  })

  it('all patterns have a valid gate', () => {
    const validGates = new Set([
      'GATE_1_VITALS', 'GATE_2_HTN', 'GATE_3_GLUCOSE', 'GATE_4_OCCULT_SHOCK',
      'GATE_5_SEPSIS', 'GATE_6_RESPIRATORY', 'GATE_7_PEDIATRIC', 'GATE_8_OBSTETRIC',
      'GATE_9_PE', 'GATE_10_ANAPHYLAXIS',
      'GATE_11_ACS', 'GATE_12_STROKE', 'GATE_13_ANEMIA_BLEED',
    ])
    for (const pattern of SYMPHONY_CLINICAL_PATTERNS) {
      expect(validGates.has(pattern.gate)).toBe(true)
    }
  })

  it('has correct gate distribution for mapped gates', () => {
    const sepsisPatterns = SYMPHONY_CLINICAL_PATTERNS.filter(p => p.gate === 'GATE_5_SEPSIS')
    // GATE_SEPSIS_EARLY (20) + GATE_SEPTIC_SHOCK_HIGH (3) = 23
    expect(sepsisPatterns.length).toBe(23)
  })
})

// ---------------------------------------------------------------------------
// 2. evaluateClinicalPatterns — return type
// ---------------------------------------------------------------------------

describe('evaluateClinicalPatterns return type', () => {
  it('returns an array', () => {
    const result = evaluateClinicalPatterns(makeNormalSnapshot())
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns SymphonyAlert-shaped objects when alerts fire', () => {
    const result = evaluateClinicalPatterns(makeQsofa2Snapshot())
    // At least some alert should fire (qSOFA criteria may match)
    if (result.length > 0) {
      const alert: SymphonyAlert = result[0]
      expect(typeof alert.id).toBe('string')
      expect(typeof alert.severity).toBe('string')
      expect(typeof alert.title).toBe('string')
      expect(Array.isArray(alert.reasoning)).toBe(true)
      expect(alert.source).toBe('pattern')
      expect(typeof alert.acknowledged).toBe('boolean')
      expect(typeof alert.triggeredAt).toBe('string')
    }
  })

  it('attaches canonical action protocol payload when pattern defines one', () => {
    const result = evaluateClinicalPatterns(makeQsofa2Snapshot())
    const cp001 = result.find(alert => alert.id === 'assist-cp-001')

    expect(cp001?.actionProtocolId).toBe('PROTO_SEPSIS')
    expect(cp001?.actionProtocol?.id).toBe('PROTO_SEPSIS')
    expect(cp001?.actionProtocol?.sections.some(section => section.key === 'C')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 3. Normal vitals → no alerts
// ---------------------------------------------------------------------------

describe('evaluateClinicalPatterns — normal vitals', () => {
  it('returns empty array for healthy patient', () => {
    const result = evaluateClinicalPatterns(makeNormalSnapshot())
    expect(result).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 4. CP-001 — qSOFA ≥2 (Tier A, scored 2/3)
// ---------------------------------------------------------------------------

describe('CP-001 qSOFA ≥2', () => {
  it('fires for RR=24 and SBP=95 (2 of 3 scored criteria)', () => {
    const snapshot = makeQsofa2Snapshot()
    const alerts = evaluateClinicalPatterns(snapshot)
    const cp001 = alerts.find(a => a.id === 'assist-cp-001')
    expect(cp001).toBeDefined()
    if (!cp001) throw new Error('assist-cp-001 should exist')
    expect(cp001.severity).toBe('high')
    expect(cp001.source).toBe('pattern')
    expect(cp001.gate).toBe('GATE_5_SEPSIS')
  })

  it('does not fire when only 1 qSOFA criterion is met (RR normal, SBP normal, AVPU altered)', () => {
    const snapshot: SymphonyClinicalSnapshot = {
      ...makeNormalSnapshot(),
      patient: { ...makeNormalSnapshot().patient, avpuManual: 'V' },
      // RR=14 (normal), SBP=120 (normal) → only 1/3 qSOFA → below minScore:2
    }
    const alerts = evaluateClinicalPatterns(snapshot)
    const cp001 = alerts.find(a => a.id === 'assist-cp-001')
    expect(cp001).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// 5. CP-002 — qSOFA ≥2 + suspected infection (Tier B, critical)
// ---------------------------------------------------------------------------

describe('CP-002 qSOFA ≥2 + suspected infection', () => {
  it('fires when infection flag is set and qSOFA ≥2', () => {
    const snapshot = makeQsofa2Snapshot({ suspectedInfection: true })
    const alerts = evaluateClinicalPatterns(snapshot)
    const cp002 = alerts.find(a => a.id === 'assist-cp-002')
    expect(cp002).toBeDefined()
    if (!cp002) throw new Error('assist-cp-002 should exist')
    expect(cp002.severity).toBe('critical')
  })

  it('does not fire when infection flag is missing (even with qSOFA ≥2)', () => {
    // CP-002 has suspectedInfection as a REQUIRED criterion
    const snapshot = makeQsofa2Snapshot()  // no infection flag
    const alerts = evaluateClinicalPatterns(snapshot)
    const cp002 = alerts.find(a => a.id === 'assist-cp-002')
    expect(cp002).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// 6. Alert ID format
// ---------------------------------------------------------------------------

describe('alert ID format', () => {
  it('all alert IDs follow assist-cp-NNN format', () => {
    const snapshot = makeQsofa2Snapshot({ suspectedInfection: true })
    const alerts = evaluateClinicalPatterns(snapshot)
    for (const alert of alerts) {
      expect(alert.id).toMatch(/^assist-cp-\d{3}$/)
    }
  })
})

// ---------------------------------------------------------------------------
// 7. triggeredAt injection
// ---------------------------------------------------------------------------

describe('triggeredAt parameter', () => {
  it('uses provided triggeredAt when passed', () => {
    const fixedAt = '2026-04-22T10:00:00.000Z'
    const snapshot = makeQsofa2Snapshot()
    const alerts = evaluateClinicalPatterns(snapshot, undefined, fixedAt)
    for (const alert of alerts) {
      expect(alert.triggeredAt).toBe(fixedAt)
    }
  })
})
