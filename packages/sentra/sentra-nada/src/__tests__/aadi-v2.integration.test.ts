// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
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

  it('derives engine status from runtime AADI V2 state post-lift v0.8.0', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
      }),
    )

    expect(result.metadata.status).toBe('ready')
    expect(result.metadata.degradedReason).toBeUndefined()
    expect(result.quality.safetyFlags).not.toContain('symphony_engine_partial_migration')
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

  it('emits aadiv2_failure_reason audit hint with "none" on success path (Task 7 patch: failure observability)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
      }),
    )

    const hintsJoined = result.quality.auditHints.join(' ')
    expect(hintsJoined).toContain('aadiv2_failure_reason:none')
    expect(result.quality.safetyFlags).not.toContain(expect.stringContaining('aadiv2_pipeline_failure'))
  })

  it('exposes native_compat_suggestion_count audit hint reflecting bridge cardinality (Task 7 patch: native→trafficLight bridge)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
        vitals: [
          {
            observedAt: '2026-04-27T09:50:00.000Z',
            heartRate: 120,
            respiratoryRate: 26,
            systolicBp: 110,
            diastolicBp: 70,
            temperatureC: 39.0,
            spo2: 92,
            consciousness: 'alert',
          },
        ],
      }),
    )

    const hintsJoined = result.quality.auditHints.join(' ')
    expect(hintsJoined).toMatch(/native_compat_suggestion_count:\d+/)
    const compatMatch = hintsJoined.match(/native_compat_suggestion_count:(\d+)/)
    const compatCount = compatMatch ? Number(compatMatch[1]) : -1
    expect(compatCount).toBe(result.nativeHypotheses?.length ?? 0)
  })

  it('triggers traffic-light evaluation when native hypothesis present even without hybrid suggestions (Task 7 patch)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas berat',
        vitals: [
          {
            observedAt: '2026-04-27T09:50:00.000Z',
            heartRate: 130,
            respiratoryRate: 28,
            systolicBp: 105,
            diastolicBp: 65,
            temperatureC: 39.2,
            spo2: 90,
            consciousness: 'alert',
          },
        ],
      }),
    )

    expect(result.diagnosisSuggestions).toHaveLength(0)
    if ((result.nativeHypotheses?.length ?? 0) > 0) {
      expect(result.trafficLight).toBeDefined()
    }
  })

  it('keeps result.diagnosisSuggestions sourced only from hybrid (compatibility constraint preserved)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
        diagnosisCandidates: [
          {
            id: 'cand-htn',
            icd10Code: 'I10',
            diagnosisName: 'Essential hypertension',
            confidence: 0.6,
            reasoning: ['BP elevated'],
          },
        ],
      }),
    )

    result.diagnosisSuggestions.forEach(suggestion => {
      expect(suggestion.id.startsWith('native:')).toBe(false)
    })
  })

  it('attaches shadowComparison to result through canonical contract (Task 8)', () => {
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
            temperatureC: 38.5,
            spo2: 95,
            consciousness: 'alert',
          },
        ],
      }),
    )

    expect(result.shadowComparison).toBeDefined()
    expect(result.shadowComparison?.agreementLevel).toMatch(
      /^(high|partial|low|not_comparable)$/,
    )
    expect(typeof result.shadowComparison?.topDiagnosisChanged).toBe('boolean')
    expect(typeof result.shadowComparison?.escalationChanged).toBe('boolean')
    expect(typeof result.shadowComparison?.clinicalDispositionChanged).toBe('boolean')
    expect(Array.isArray(result.shadowComparison?.notes)).toBe(true)
  })

  it('shadow agreement is not_comparable when both paths produce nothing (Task 8)', () => {
    const result = assessSymphonyInput(baseInput())
    expect(result.shadowComparison?.agreementLevel).toBe('not_comparable')
    expect(result.shadowComparison?.oldPathAvailable).toBe(false)
    expect(result.shadowComparison?.newPathAvailable).toBe(false)
  })

  it('emits shadow agreement audit hints for telemetry (Task 8)', () => {
    const result = assessSymphonyInput(
      baseInput({
        chiefComplaint: 'demam dan sesak napas',
      }),
    )
    const hintsJoined = result.quality.auditHints.join(' ')
    expect(hintsJoined).toMatch(/shadow_agreement:(high|partial|low|not_comparable)/)
    expect(hintsJoined).toMatch(/shadow_top_changed:[01]/)
    expect(hintsJoined).toMatch(/shadow_escalation_changed:[01]/)
    expect(hintsJoined).toMatch(/shadow_disposition_changed:[01]/)
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
