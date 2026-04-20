// Designed and constructed by Avvcenna+.
/**
 * anaphylaxis — RED test suite for the deterministic anaphylaxis safety gate.
 *
 * Implements the WAO 2020 diagnostic criteria adapted for primary care:
 *   - Trigger 1: acute skin/mucosa involvement PLUS respiratory OR
 *     cardiovascular OR severe GI compromise.
 *   - Trigger 2: known/likely allergen exposure PLUS >=2 organ systems.
 *   - Trigger 3: known/likely allergen exposure PLUS isolated hypotension.
 *
 * Emits CRITICAL alert `SYMPHONY_ANAPHYLAXIS` with `source: 'safety_gate'`
 * and `gate: 'GATE_10_ANAPHYLAXIS'`.
 */

import { describe, expect, it } from 'vitest'

import {
  anaphylaxisToSymphonyAlerts,
  assessSymphonyInput,
  detectSymphonyAnaphylaxis,
  type SymphonyAnaphylaxisInput,
  type SymphonyAssessmentInput,
} from '../index'

const REQUESTED_AT = '2026-04-19T10:00:00.000Z'

function baseAssessment(
  overrides: Partial<SymphonyAssessmentInput> = {}
): SymphonyAssessmentInput {
  return {
    metadata: {
      requestId: 'test-request',
      requestedAt: REQUESTED_AT,
      caller: 'dashboard',
      ...(overrides.metadata ?? {}),
    },
    patientContext: {
      encounterId: 'enc-anaph-1',
      patientRef: 'patient-anaph-1',
      ageYears: 30,
      sexAtBirth: 'female',
      pregnancyStatus: 'not_pregnant',
      ...(overrides.patientContext ?? {}),
    },
    vitals: overrides.vitals ?? [],
    chiefComplaint: overrides.chiefComplaint,
    additionalComplaint: overrides.additionalComplaint,
    medicalHistory: overrides.medicalHistory,
    hasCOPD: overrides.hasCOPD,
    allergies: overrides.allergies,
    diagnosisCandidates: overrides.diagnosisCandidates,
  }
}

describe('detectSymphonyAnaphylaxis — Trigger 1: skin/mucosa + respiratory or CV', () => {
  it('fires on skin + mucosa + respiratory compromise (classic)', () => {
    const input: SymphonyAnaphylaxisInput = {
      latestVitals: {
        observedAt: REQUESTED_AT,
        heartRate: 115,
        spo2: 93,
        respiratoryRate: 26,
      },
      chiefComplaint: 'bentol seluruh tubuh dan bengkak bibir, sesak napas disertai mengi',
    }
    const result = detectSymphonyAnaphylaxis(input)
    expect(result.suspect).toBe(true)
    expect(result.trigger).toBe(1)
    expect(result.involvedSystems).toContain('skin_mucosa')
    expect(result.involvedSystems).toContain('respiratory')
  })

  it('fires on skin + cardiovascular compromise (hypotension + syncope)', () => {
    const input: SymphonyAnaphylaxisInput = {
      latestVitals: { observedAt: REQUESTED_AT, systolicBp: 82, heartRate: 120 },
      chiefComplaint: 'ruam gatal seluruh tubuh, sempat pingsan',
    }
    const result = detectSymphonyAnaphylaxis(input)
    expect(result.suspect).toBe(true)
    expect(result.trigger).toBe(1)
    expect(result.involvedSystems).toContain('skin_mucosa')
    expect(result.involvedSystems).toContain('cardiovascular')
  })
})

describe('detectSymphonyAnaphylaxis — Trigger 2: exposure + >=2 systems', () => {
  it('fires on allergen exposure + GI + cardiovascular', () => {
    const input: SymphonyAnaphylaxisInput = {
      latestVitals: { observedAt: REQUESTED_AT, systolicBp: 85 },
      chiefComplaint: 'muntah berulang, diare, tekanan darah turun setelah suntik penisilin',
    }
    const result = detectSymphonyAnaphylaxis(input)
    expect(result.suspect).toBe(true)
    expect(result.trigger).toBe(2)
    expect(result.involvedSystems).toContain('gastrointestinal')
    expect(result.involvedSystems).toContain('cardiovascular')
    expect(result.exposureContext).toBe(true)
  })
})

describe('detectSymphonyAnaphylaxis — Trigger 3: exposure + isolated hypotension', () => {
  it('fires on known allergen exposure + systolic BP < 90 alone', () => {
    const input: SymphonyAnaphylaxisInput = {
      latestVitals: { observedAt: REQUESTED_AT, systolicBp: 80 },
      chiefComplaint: 'setelah minum amoksisilin, pasien terasa lemas',
      allergies: ['amoksisilin'],
    }
    const result = detectSymphonyAnaphylaxis(input)
    expect(result.suspect).toBe(true)
    expect(result.trigger).toBe(3)
    expect(result.hypotension).toBe(true)
  })
})

describe('detectSymphonyAnaphylaxis — negative cases', () => {
  it('does NOT fire on isolated urticaria with no respiratory or CV', () => {
    const result = detectSymphonyAnaphylaxis({
      latestVitals: { observedAt: REQUESTED_AT, heartRate: 88, spo2: 99, systolicBp: 120 },
      chiefComplaint: 'bentol gatal di lengan',
    })
    expect(result.suspect).toBe(false)
    expect(result.trigger).toBeNull()
  })

  it('does NOT fire on dyspnea alone without skin or exposure context', () => {
    const result = detectSymphonyAnaphylaxis({
      latestVitals: { observedAt: REQUESTED_AT, respiratoryRate: 24 },
      chiefComplaint: 'sesak napas',
    })
    expect(result.suspect).toBe(false)
  })
})

describe('detectSymphonyAnaphylaxis — alert shape', () => {
  it('emits CRITICAL alert with gate GATE_10_ANAPHYLAXIS and source safety_gate', () => {
    const detection = detectSymphonyAnaphylaxis({
      latestVitals: {
        observedAt: REQUESTED_AT,
        heartRate: 115,
        spo2: 93,
        respiratoryRate: 26,
      },
      chiefComplaint: 'bentol seluruh tubuh dan bengkak bibir, sesak napas',
    })
    const alerts = anaphylaxisToSymphonyAlerts(detection, REQUESTED_AT)
    expect(alerts).toHaveLength(1)
    const alert = alerts[0]
    expect(alert.id).toBe('SYMPHONY_ANAPHYLAXIS')
    expect(alert.severity).toBe('critical')
    expect(alert.source).toBe('safety_gate')
    expect(alert.gate).toBe('GATE_10_ANAPHYLAXIS')
    expect(alert.triggeredAt).toBe(REQUESTED_AT)
    expect(alert.acknowledged).toBe(false)
    expect(alert.reasoning.length).toBeGreaterThan(0)
  })

  it('emits no alert when detection is negative', () => {
    const detection = detectSymphonyAnaphylaxis({
      latestVitals: { observedAt: REQUESTED_AT, heartRate: 80, spo2: 98, systolicBp: 120 },
      chiefComplaint: 'sakit kepala',
    })
    expect(anaphylaxisToSymphonyAlerts(detection, REQUESTED_AT)).toEqual([])
  })
})

describe('assessSymphonyInput — Anaphylaxis gate injection', () => {
  it('injects SYMPHONY_ANAPHYLAXIS alert via assessSymphonyInput on positive trigger', () => {
    const input = baseAssessment({
      vitals: [
        {
          observedAt: REQUESTED_AT,
          heartRate: 115,
          spo2: 93,
          respiratoryRate: 26,
          systolicBp: 100,
          diastolicBp: 70,
          temperatureC: 37.0,
        },
      ],
      chiefComplaint:
        'bentol seluruh tubuh, bengkak bibir dan wajah, sesak napas setelah makan udang',
      allergies: ['seafood'],
    })
    const result = assessSymphonyInput(input)
    const anaphAlert = result.alerts.find(
      (a) => a.id === 'SYMPHONY_ANAPHYLAXIS' && a.gate === 'GATE_10_ANAPHYLAXIS'
    )
    expect(anaphAlert).toBeDefined()
    expect(anaphAlert?.severity).toBe('critical')
    expect(anaphAlert?.source).toBe('safety_gate')
  })

  it('does not inject SYMPHONY_ANAPHYLAXIS when no trigger met', () => {
    const input = baseAssessment({
      vitals: [
        {
          observedAt: REQUESTED_AT,
          heartRate: 80,
          spo2: 98,
          respiratoryRate: 16,
          systolicBp: 120,
          diastolicBp: 80,
          temperatureC: 37.0,
        },
      ],
      chiefComplaint: 'nyeri kepala',
    })
    const result = assessSymphonyInput(input)
    const anaphAlert = result.alerts.find((a) => a.id === 'SYMPHONY_ANAPHYLAXIS')
    expect(anaphAlert).toBeUndefined()
  })
})
