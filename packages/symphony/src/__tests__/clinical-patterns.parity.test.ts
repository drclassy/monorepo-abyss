// Designed and constructed by Classy.
/**
 * clinical-patterns.parity — parity tests for Phase 3.
 *
 * For a representative sample of CP definitions (across all 11 gates), verify:
 *   1. A trigger snapshot can be built that fires the CP.
 *   2. The resulting alert has the same id, severity, and title as the adapter produces.
 *
 * Full 70-CP parity is validated by the parity suite at the bottom.
 * CPs with `patient.physiology.isOlderAdult` required criteria are tested
 * with a physiology cast to allow nested resolution.
 */

import { describe, expect, it } from 'vitest'

import {
  adaptAssistPatternToSymphonyAlert,
  ASSIST_PATTERN_PARITY_DEFINITIONS,
  assistPatternAlertId,
  type AssistPatternParityDefinition,
  type AssistPatternParityCriterion,
} from '../adapters/assist-patterns-parity'
import { evaluateClinicalPatterns } from '../engine/clinical-patterns'
import type { SymphonyClinicalSnapshot, SymphonySymptomContext, SymphonySymptomSignalResult } from '../index'

// ---------------------------------------------------------------------------
// Trigger snapshot builder
// ---------------------------------------------------------------------------
// Builds a SymphonyClinicalSnapshot that satisfies ALL criteria in a given
// AssistPatternParityDefinition (required + scored). Uses type casts for
// fields that don't map cleanly to the current SymphonyClinicalSnapshot type
// (e.g. patient.physiology.isOlderAdult, symptoms.* boolean flags).

function buildTriggerSnapshot(def: AssistPatternParityDefinition): SymphonyClinicalSnapshot {
  // Abnormal vital defaults — satisfy most threshold criteria
  const vitals = {
    sbp: 88,
    dbp: 58,
    hr: 126,
    rr: 26,
    temp: 38.7,
    spo2: 91,
    glucose: 42,
  }
  const derived = {
    map: 68,
    shockIndex: 1.43,
    avpuLevel: 'P' as const,
    htnSeverity: 'stage2' as const,
    glucoseCategory: 'hypoglycemic' as const,
    hasHypotension: true,
    pulsePressure: 30,
  }
  const history: SymphonyClinicalSnapshot['history'] = {
    bpHistory: [],
    knownHTN: true,
    knownDM: true,
    knownAsthma: true,
    knownCOPD: true,
    pregnancyStatus: true,
    allergies: ['alergen tidak spesifik'],
    chronicDiseases: [],
  }
  // Start with empty signals; boolean symptom flags will be added dynamically
  const symptoms: SymphonySymptomSignalResult & SymphonySymptomContext = {
    signals: [],
    negatedSignals: [],
  }
  // patient.physiology cast to object so isOlderAdult resolves
  const patient = {
    age: 78,
    physiology: { isOlderAdult: true } as unknown as SymphonyClinicalSnapshot['patient']['physiology'],
    avpuManual: 'P' as const,
    supplementalO2: true,
    painScore: 9,
  }

  const allCriteria: AssistPatternParityCriterion[] = [
    ...def.criteria.required,
    ...def.criteria.scored,
  ]

  for (const criterion of allCriteria) {
    const { field, op, value } = criterion

    if (field.startsWith('symptoms.')) {
      const key = field.slice('symptoms.'.length) as keyof SymphonySymptomContext
      if (op === 'true') {
        symptoms[key] = true
      }
      continue
    }

    if (field === 'history.pregnancyStatus' && op === 'true') {
      history.pregnancyStatus = true
      continue
    }
    if (field === 'history.knownAsthma' && op === 'true') {
      history.knownAsthma = true
      continue
    }
    if (field === 'history.knownCOPD' && op === 'true') {
      history.knownCOPD = true
      continue
    }
    if (field === 'history.knownDM' && op === 'true') {
      history.knownDM = true
      continue
    }

    // Numeric vitals — set to satisfying value
    if (field === 'vitals.sbp') {
      if (op === 'lte') vitals.sbp = Math.min(vitals.sbp, value as number)
      if (op === 'gte') vitals.sbp = Math.max(vitals.sbp, value as number)
      if (op === 'gt') vitals.sbp = (value as number) + 1
      if (op === 'lt') vitals.sbp = (value as number) - 1
      if (op === 'between') { const [lo, hi] = value as [number, number]; vitals.sbp = Math.round((lo + hi) / 2) }
    }
    if (field === 'vitals.hr') {
      if (op === 'gte') vitals.hr = Math.max(vitals.hr, value as number)
      if (op === 'lte') vitals.hr = Math.min(vitals.hr, value as number)
      if (op === 'gt') vitals.hr = (value as number) + 1
      if (op === 'lt') vitals.hr = (value as number) - 1
      if (op === 'between') { const [lo, hi] = value as [number, number]; vitals.hr = Math.round((lo + hi) / 2) }
    }
    if (field === 'vitals.rr') {
      if (op === 'gte') vitals.rr = Math.max(vitals.rr, value as number)
      if (op === 'lte') vitals.rr = Math.min(vitals.rr, value as number)
      if (op === 'gt') vitals.rr = (value as number) + 1
      if (op === 'lt') vitals.rr = (value as number) - 1
      if (op === 'between') { const [lo, hi] = value as [number, number]; vitals.rr = Math.round((lo + hi) / 2) }
    }
    if (field === 'vitals.spo2') {
      if (op === 'lte') vitals.spo2 = Math.min(vitals.spo2, value as number)
      if (op === 'lt') vitals.spo2 = (value as number) - 1
      if (op === 'gte') vitals.spo2 = Math.max(vitals.spo2, value as number)
      if (op === 'gt') vitals.spo2 = (value as number) + 1
    }
    if (field === 'vitals.temp') {
      if (op === 'gte') vitals.temp = Math.max(vitals.temp, value as number)
      if (op === 'gt') vitals.temp = (value as number) + 0.1
      if (op === 'lt') vitals.temp = (value as number) - 0.2
      if (op === 'lte') vitals.temp = Math.min(vitals.temp, value as number)
    }
    if (field === 'vitals.glucose') {
      if (op === 'lte') vitals.glucose = Math.min(vitals.glucose, value as number)
      if (op === 'lt') vitals.glucose = (value as number) - 1
      if (op === 'gte') vitals.glucose = Math.max(vitals.glucose, value as number)
    }
    if (field === 'derived.shockIndex') {
      if (op === 'gte') derived.shockIndex = Math.max(derived.shockIndex, value as number)
      if (op === 'lt') derived.shockIndex = (value as number) - 0.05
      if (op === 'lte') derived.shockIndex = Math.min(derived.shockIndex, value as number)
      if (op === 'between') {
        const [lo, hi] = value as [number, number]
        derived.shockIndex = (lo + hi) / 2
      }
    }
    if (field === 'derived.map') {
      if (op === 'lt') derived.map = (value as number) - 1
      if (op === 'lte') derived.map = Math.min(derived.map, value as number)
    }
    if (field === 'derived.glucoseCategory' && op === 'eq') {
      derived.glucoseCategory = value as typeof derived.glucoseCategory
    }
    if (field === 'patient.avpuManual' && op === 'neq') {
      patient.avpuManual = value === 'A' ? 'V' : 'A'
    }
    if (field === 'patient.avpuManual' && op === 'eq') {
      patient.avpuManual = value as typeof patient.avpuManual
    }
    if (field === 'patient.avpuManual' && op === 'in') {
      const vals = (value as string).split(',')
      patient.avpuManual = vals[0] as typeof patient.avpuManual
    }
    if (field === 'patient.supplementalO2' && op === 'true') {
      patient.supplementalO2 = true
    }
    if (field === 'patient.supplementalO2' && op === 'false') {
      patient.supplementalO2 = false
    }
    if (field === 'patient.age') {
      if (op === 'lt') patient.age = (value as number) - 1
      if (op === 'lte') patient.age = value as number
      if (op === 'gte') patient.age = Math.max(patient.age, value as number)
      if (op === 'gt') patient.age = (value as number) + 1
      if (op === 'between') { const [lo, hi] = value as [number, number]; patient.age = Math.round((lo + hi) / 2) }
    }
  }

  return {
    vitals,
    derived,
    symptoms,
    history,
    patient,
    timestamp: Date.now(),
  }
}

// ---------------------------------------------------------------------------
// Representative parity checks (one per gate group)
// ---------------------------------------------------------------------------

describe('clinical-patterns parity — representative CPs per gate', () => {
  function parityCheck(patternId: string) {
    const def = ASSIST_PATTERN_PARITY_DEFINITIONS.find(d => d.id === patternId)
    if (!def) throw new Error(`Pattern ${patternId} not found in ASSIST_PATTERN_PARITY_DEFINITIONS`)

    const snapshot = buildTriggerSnapshot(def)
    const alerts = evaluateClinicalPatterns(snapshot)
    const expected = { id: assistPatternAlertId(def.id), severity: def.severity, title: def.title }
    const found = alerts.find(a => a.id === expected.id)

    return { found, expected }
  }

  // GATE_SEPSIS_EARLY → GATE_5_SEPSIS
  it('CP-001 qSOFA ≥2 (GATE_5_SEPSIS, high, tier A)', () => {
    const { found, expected } = parityCheck('CP-001')
    expect(found).toBeDefined()
    if (!found) throw new Error('CP-001 should produce an alert')
    expect(found.severity).toBe(expected.severity)
    expect(found.title).toBe(expected.title)
  })

  it('CP-002 qSOFA ≥2 + infeksi (GATE_5_SEPSIS, critical, tier B)', () => {
    const { found, expected } = parityCheck('CP-002')
    expect(found).toBeDefined()
    if (!found) throw new Error('CP-002 should produce an alert')
    expect(found.severity).toBe(expected.severity)
  })
})

// ---------------------------------------------------------------------------
// Full 70-CP parity suite
// ---------------------------------------------------------------------------

describe('clinical-patterns parity — all 70 CPs', () => {
  const FIXED_TS = '2026-01-01T00:00:00.000Z'

  for (const def of ASSIST_PATTERN_PARITY_DEFINITIONS) {
    it(`${def.id} → deep-equal stable fields against adapter output`, () => {
      const snapshot = buildTriggerSnapshot(def)
      const alerts = evaluateClinicalPatterns(snapshot, undefined, FIXED_TS)
      const adapterAlert = adaptAssistPatternToSymphonyAlert(def, { triggeredAt: FIXED_TS })

      const found = alerts.find(a => a.id === adapterAlert.id)
      expect(found).toBeDefined()
      if (!found) throw new Error(`Missing alert for ${def.id}`)

      // Deep-equal on stable shape fields — reasoning and triggeredAt differ by design
      const { reasoning: _fr, triggeredAt: _ft, ...foundRest } = found
      const { reasoning: _ar, triggeredAt: _at, ...adapterRest } = adapterAlert
      expect(foundRest).toEqual(adapterRest)
    })
  }
})
