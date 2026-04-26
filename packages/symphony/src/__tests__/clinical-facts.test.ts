import { describe, expect, it } from 'vitest'

import {
  buildSymphonyClinicalFacts,
  type SymphonyAssessmentInput,
} from '../index'

describe('buildSymphonyClinicalFacts', () => {
  it('reuses symptom, snapshot-pattern, classifier, anaphylaxis, and trajectory signals', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'fact-1',
        requestedAt: '2026-04-27T10:00:00.000Z',
        caller: 'system',
      },
      patientContext: {
        encounterId: 'enc-1',
        patientRef: 'pat-1',
        ageYears: 54,
        sexAtBirth: 'male',
        pregnancyStatus: 'not_applicable',
      },
      vitals: [
        {
          observedAt: '2026-04-27T09:40:00.000Z',
          systolicBp: 150,
          diastolicBp: 96,
          heartRate: 88,
          respiratoryRate: 18,
          temperatureC: 37.8,
          spo2: 95,
          consciousness: 'alert',
        },
        {
          observedAt: '2026-04-27T10:00:00.000Z',
          systolicBp: 170,
          diastolicBp: 104,
          heartRate: 112,
          respiratoryRate: 24,
          temperatureC: 38.4,
          spo2: 92,
          consciousness: 'alert',
        },
      ],
      chiefComplaint: 'demam dan sesak sejak tadi pagi',
      chronicDiseases: ['I10'],
    }

    const result = buildSymphonyClinicalFacts(input)
    const keys = result.facts.map(item => item.key)

    expect(keys).toContain('symptom_fever')
    expect(keys).toContain('symptom_dyspnea')
    expect(keys).toContain('htn_severity')
    expect(keys).toContain('pattern_alert_count')
    expect(keys).toContain('anaphylaxis_suspect')
    expect(keys).toContain('trajectory_direction')
    expect(result.snapshot.patient.age).toBe(54)
    expect(result.patternAlerts).toBeDefined()
  })
})
