// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
// Designed and constructed by Classy.
/**
 * pe-suspect — RED test suite for the deterministic PE (pulmonary embolism)
 * suspect safety gate.
 *
 * Detection follows a simplified Wells-inspired criteria count adapted for
 * Indonesian primary care. The gate fires a CRITICAL alert with stable
 * id `SYMPHONY_PE_SUSPECT`, `source: 'safety_gate'`, `gate: 'GATE_9_PE'`.
 *
 * Invariants under test:
 *   - Positive cases (>=3 criteria) emit the CRITICAL alert.
 *   - Negative cases (<=2 criteria) emit no alert.
 *   - Alert carries typed `gate: 'GATE_9_PE'` and records the matched criteria in `reasoning`.
 *   - `assessSymphonyInput()` injects the PE alert when the same positive
 *     input is evaluated through the top-level assessor.
 */

import { describe, expect, it } from 'vitest'

import {
  assessSymphonyInput,
  detectSymphonyPeSuspect,
  peSuspectToSymphonyAlerts,
  type SymphonyAssessmentInput,
  type SymphonyPeSuspectInput,
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
      encounterId: 'enc-pe-1',
      patientRef: 'patient-pe-1',
      ageYears: 45,
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

describe('detectSymphonyPeSuspect — positive cases', () => {
  it('fires on classic PE triad: tachycardia + hypoxia + sudden dyspnea', () => {
    const input: SymphonyPeSuspectInput = {
      latestVitals: {
        observedAt: REQUESTED_AT,
        heartRate: 118,
        spo2: 90,
        respiratoryRate: 24,
      },
      chiefComplaint: 'sesak napas mendadak sejak 2 jam lalu, nyeri dada pleuritik',
      medicalHistory: [],
    }
    const result = detectSymphonyPeSuspect(input)
    expect(result.suspect).toBe(true)
    expect(result.criteriaMet.length).toBeGreaterThanOrEqual(3)
  })

  it('fires on unilateral leg swelling + immobilization + tachycardia', () => {
    const input: SymphonyPeSuspectInput = {
      latestVitals: {
        observedAt: REQUESTED_AT,
        heartRate: 112,
      },
      chiefComplaint: 'bengkak kaki kiri disertai nyeri',
      medicalHistory: ['bedrest 5 hari paska operasi fraktur'],
    }
    const result = detectSymphonyPeSuspect(input)
    expect(result.suspect).toBe(true)
    expect(result.criteriaMet).toContain('unilateral_leg_swelling')
    expect(result.criteriaMet).toContain('recent_immobilization_or_surgery')
  })

  it('fires on hemoptysis + prior DVT history + pregnancy', () => {
    const input: SymphonyPeSuspectInput = {
      latestVitals: { observedAt: REQUESTED_AT, heartRate: 95 },
      chiefComplaint: 'batuk darah sejak pagi',
      medicalHistory: ['riwayat DVT tungkai kiri 2 tahun lalu'],
      pregnancyStatus: 'pregnant',
    }
    const result = detectSymphonyPeSuspect(input)
    expect(result.suspect).toBe(true)
    expect(result.criteriaMet).toContain('hemoptysis')
    expect(result.criteriaMet).toContain('prior_dvt_or_pe')
    expect(result.criteriaMet).toContain('active_pregnancy')
  })

  it('returns a CRITICAL alert with gate GATE_9_PE and source safety_gate', () => {
    const detection = detectSymphonyPeSuspect({
      latestVitals: {
        observedAt: REQUESTED_AT,
        heartRate: 118,
        spo2: 90,
        respiratoryRate: 24,
      },
      chiefComplaint: 'sesak napas mendadak',
      medicalHistory: [],
    })
    const alerts = peSuspectToSymphonyAlerts(detection, REQUESTED_AT)
    expect(alerts).toHaveLength(1)
    const alert = alerts[0]
    expect(alert.id).toBe('SYMPHONY_PE_SUSPECT')
    expect(alert.severity).toBe('critical')
    expect(alert.source).toBe('safety_gate')
    expect(alert.gate).toBe('GATE_9_PE')
    expect(alert.triggeredAt).toBe(REQUESTED_AT)
    expect(alert.acknowledged).toBe(false)
    expect(alert.reasoning.length).toBeGreaterThan(0)
  })
})

describe('detectSymphonyPeSuspect — negative cases', () => {
  it('does not fire on isolated tachycardia (single criterion)', () => {
    const result = detectSymphonyPeSuspect({
      latestVitals: { observedAt: REQUESTED_AT, heartRate: 110 },
      chiefComplaint: 'demam tinggi',
      medicalHistory: [],
    })
    expect(result.suspect).toBe(false)
    expect(result.criteriaMet.length).toBeLessThanOrEqual(2)
  })

  it('does not fire on two unrelated criteria below threshold', () => {
    const result = detectSymphonyPeSuspect({
      latestVitals: { observedAt: REQUESTED_AT, heartRate: 105, spo2: 96 },
      chiefComplaint: 'nyeri kepala',
      medicalHistory: [],
    })
    expect(result.suspect).toBe(false)
  })

  it('emits no alert when detection is negative', () => {
    const detection = detectSymphonyPeSuspect({
      latestVitals: { observedAt: REQUESTED_AT, heartRate: 80, spo2: 98 },
      chiefComplaint: 'sakit kepala',
      medicalHistory: [],
    })
    expect(peSuspectToSymphonyAlerts(detection, REQUESTED_AT)).toEqual([])
  })
})

describe('assessSymphonyInput — PE gate injection', () => {
  it('injects SYMPHONY_PE_SUSPECT alert via assessSymphonyInput when PE criteria met', () => {
    const input = baseAssessment({
      vitals: [
        {
          observedAt: REQUESTED_AT,
          heartRate: 118,
          spo2: 90,
          respiratoryRate: 24,
          systolicBp: 110,
          diastolicBp: 70,
          temperatureC: 37.2,
        },
      ],
      chiefComplaint: 'sesak napas mendadak, nyeri dada pleuritik',
      medicalHistory: ['riwayat DVT'],
    })
    const result = assessSymphonyInput(input)
    const peAlert = result.alerts.find(
      (a) => a.id === 'SYMPHONY_PE_SUSPECT' && a.gate === 'GATE_9_PE'
    )
    expect(peAlert).toBeDefined()
    expect(peAlert?.severity).toBe('critical')
    expect(peAlert?.source).toBe('safety_gate')
  })

  it('does not inject SYMPHONY_PE_SUSPECT when PE criteria not met', () => {
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
      medicalHistory: [],
    })
    const result = assessSymphonyInput(input)
    const peAlert = result.alerts.find((a) => a.id === 'SYMPHONY_PE_SUSPECT')
    expect(peAlert).toBeUndefined()
  })
})
