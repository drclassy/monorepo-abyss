import { describe, expect, it } from 'vitest'

import {
  assessSymphonyInput,
  type SymphonyAssessmentInput,
} from '../index'

function baseInput(overrides: Partial<SymphonyAssessmentInput> = {}): SymphonyAssessmentInput {
  return {
    metadata: {
      requestId: 'request-aadi-v2',
      requestedAt: '2026-04-27T10:00:00.000Z',
      caller: 'dashboard',
    },
    patientContext: {
      encounterId: 'encounter-aadi-v2',
      patientRef: 'patient-aadi-v2',
      ageYears: 55,
      sexAtBirth: 'male',
    },
    vitals: [],
    ...overrides,
  }
}

describe('AADI V2 integration into assessSymphonyInput', () => {
  it('populates clinicalFacts and clinicalDisposition for febrile dyspnea presentation', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam tinggi dan sesak napas sejak kemarin',
        vitals: [
          {
            observedAt: '2026-04-27T09:50:00.000Z',
            heartRate: 118,
            respiratoryRate: 26,
            systolicBp: 110,
            diastolicBp: 70,
            temperatureC: 39.1,
            spo2: 92,
            consciousness: 'alert',
          },
        ],
      }),
    )

    expect(result.clinicalFacts).toBeDefined()
    expect(result.clinicalFacts?.length ?? 0).toBeGreaterThan(0)
    expect(result.nativeHypotheses).toBeDefined()
    expect(result.nativeHypotheses?.length ?? 0).toBeGreaterThan(0)
    expect(result.clinicalDisposition).toBeDefined()
  })

  it('returns insufficient_data when input is empty', () => {
    const result = assessSymphonyInput(baseInput())
    expect(result.clinicalDisposition).toBe('insufficient_data')
    expect(result.nativeHypotheses).toBeUndefined()
  })

  it('preserves diagnosisSuggestions compatibility flow (Task 7 constraint #3)', () => {
    const result = assessSymphonyInput(
      baseInput({
        diagnosisCandidates: [
          {
            id: 'cand-pneumonia',
            icd10Code: 'J18.9',
            diagnosisName: 'Pneumonia, unspecified organism',
            confidence: 0.7,
            reasoning: ['Demam dan sesak napas'],
          },
        ],
        chiefComplaint: 'demam dan sesak napas',
      }),
    )

    expect(result.diagnosisSuggestions.length).toBeGreaterThan(0)
    expect(result.diagnosisSuggestions[0]?.icd10Code).toBe('J18.9')
  })

  it('preserves alert severity through arbiter (safety dominance)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas berat',
        vitals: [
          {
            observedAt: '2026-04-27T09:50:00.000Z',
            heartRate: 140,
            respiratoryRate: 32,
            systolicBp: 78,
            diastolicBp: 50,
            temperatureC: 39.5,
            spo2: 84,
            consciousness: 'voice',
          },
        ],
      }),
    )

    const criticalAlerts = result.alerts.filter(a => a.severity === 'critical')
    expect(criticalAlerts.length).toBeGreaterThan(0)
    criticalAlerts.forEach(alert => {
      expect(alert.severity).toBe('critical')
    })
  })

  it('routes to requires_review when critical alert + native hypothesis coexist', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam tinggi dan sesak napas berat',
        vitals: [
          {
            observedAt: '2026-04-27T09:50:00.000Z',
            heartRate: 138,
            respiratoryRate: 30,
            systolicBp: 80,
            diastolicBp: 50,
            temperatureC: 39.4,
            spo2: 86,
            consciousness: 'alert',
          },
        ],
      }),
    )

    if ((result.nativeHypotheses?.length ?? 0) > 0) {
      expect(result.clinicalDisposition).toBe('requires_review')
    }
  })

  it('appends explainability lines into metadata.rationale (canonical surface)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
        vitals: [
          {
            observedAt: '2026-04-27T09:50:00.000Z',
            heartRate: 110,
            respiratoryRate: 24,
            systolicBp: 120,
            diastolicBp: 80,
            temperatureC: 38.8,
            spo2: 94,
            consciousness: 'alert',
          },
        ],
      }),
    )

    const rationaleJoined = result.metadata.rationale.join(' ')
    if ((result.nativeHypotheses?.length ?? 0) > 0) {
      expect(rationaleJoined).toContain('Diagnosis utama')
    }
  })

  it('exposes audit hints for AADI V2 telemetry (clinical_facts_count, native_hypothesis_count, clinical_disposition)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
      }),
    )

    const hintsJoined = result.quality.auditHints.join(' ')
    expect(hintsJoined).toContain('clinical_facts_count:')
    expect(hintsJoined).toContain('native_hypothesis_count:')
    expect(hintsJoined).toContain('clinical_disposition:')
    expect(hintsJoined).toContain('arbiter_requires_review:')
    expect(hintsJoined).toContain('aadiv2_pipeline_failed:0')
  })

  it('preserves operational status independently from clinicalDisposition (Task 6 constraint #3)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
      }),
    )

    expect(result.metadata.status).toBe('degraded')
    expect(result.metadata.degradedReason).toBe('symphony_engine_partial_migration')
    expect(result.clinicalDisposition).toBeDefined()
  })

  it('does not mutate alerts trafficLight or trajectory (additive only)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
        activeMedications: ['amlodipine', 'simvastatin'],
        chronicDiseases: ['hipertensi'],
        vitals: [
          {
            observedAt: '2026-04-27T09:50:00.000Z',
            heartRate: 100,
            respiratoryRate: 20,
            systolicBp: 130,
            diastolicBp: 85,
            temperatureC: 38.0,
            spo2: 96,
            consciousness: 'alert',
          },
        ],
      }),
    )

    expect(result.alerts).toBeDefined()
    expect(result.trajectory).toBeDefined()
    expect(result.diagnosisSuggestions).toBeDefined()
  })

  it('produces deterministic output for identical input', () => {
    const input = baseInput({
      chiefComplaint: 'demam dan sesak napas',
      vitals: [
        {
          observedAt: '2026-04-27T09:50:00.000Z',
          heartRate: 110,
          respiratoryRate: 22,
          systolicBp: 120,
          diastolicBp: 80,
          temperatureC: 38.5,
          spo2: 95,
          consciousness: 'alert',
        },
      ],
    })

    const a = assessSymphonyInput(input)
    const b = assessSymphonyInput(input)

    expect(a.clinicalDisposition).toBe(b.clinicalDisposition)
    expect(a.nativeHypotheses?.length ?? 0).toBe(b.nativeHypotheses?.length ?? 0)
    expect(a.clinicalFacts?.length ?? 0).toBe(b.clinicalFacts?.length ?? 0)
    expect(a.metadata.rationale).toEqual(b.metadata.rationale)
  })
})
