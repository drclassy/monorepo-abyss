// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  assessSymphonyInput,
  calculateSymphonyNEWS2,
  detectSymphonyEarlyWarningPatterns,
  type SymphonyAssessmentInput,
} from '../index'

describe('SYMPHONY early-warning parity slice', () => {
  it('detects imminent dengue shock pattern from defervescence, tachycardia, and narrow pulse pressure', () => {
    const matches = detectSymphonyEarlyWarningPatterns({
      chiefComplaint: 'Demam berdarah hari keempat, badan mulai dingin',
      latestVitals: {
        observedAt: '2026-04-18T00:00:00.000Z',
        temperatureC: 36.4,
        heartRate: 112,
        systolicBp: 96,
        diastolicBp: 78,
      },
      news2: calculateSymphonyNEWS2({
        vitals: {
          observedAt: '2026-04-18T00:00:00.000Z',
          temperatureC: 36.4,
          heartRate: 112,
          systolicBp: 96,
        },
      }),
    })

    expect(matches[0]?.patternId).toBe('DHF_SHOCK_IMMINENT')
    expect(matches[0]?.severity).toBe('critical')
  })

  it('detects qSOFA sepsis pattern from RR, SBP, and altered consciousness', () => {
    const matches = detectSymphonyEarlyWarningPatterns({
      chiefComplaint: 'Demam dan batuk infeksi paru',
      latestVitals: {
        observedAt: '2026-04-18T00:00:00.000Z',
        respiratoryRate: 24,
        systolicBp: 98,
        consciousness: 'voice',
      },
      news2: calculateSymphonyNEWS2({
        vitals: {
          observedAt: '2026-04-18T00:00:00.000Z',
          respiratoryRate: 24,
          systolicBp: 98,
          consciousness: 'voice',
        },
      }),
    })

    expect(matches[0]?.patternId).toBe('SEPSIS_QSOFA')
    expect(matches[0]?.severity).toBe('critical')
  })

  it('detects respiratory failure pattern from respiratory complaint plus RR, SpO2, and HR', () => {
    const matches = detectSymphonyEarlyWarningPatterns({
      chiefComplaint: 'Sesak napas berat sejak pagi',
      latestVitals: {
        observedAt: '2026-04-18T00:00:00.000Z',
        respiratoryRate: 26,
        spo2: 92,
        heartRate: 108,
      },
      news2: calculateSymphonyNEWS2({
        vitals: {
          observedAt: '2026-04-18T00:00:00.000Z',
          respiratoryRate: 26,
          spo2: 92,
          heartRate: 108,
        },
      }),
    })

    expect(matches[0]?.patternId).toBe('RESP_FAILURE_IMMINENT')
    expect(matches[0]?.severity).toBe('critical')
  })

  it('injects pattern alerts into assessment output', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-pattern',
        requestedAt: '2026-04-18T00:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-pattern',
        patientRef: 'patient-pattern',
      },
      chiefComplaint: 'Nyeri dada berat dan keringat dingin',
      vitals: [
        {
          observedAt: '2026-04-18T00:00:00.000Z',
          systolicBp: 92,
          heartRate: 118,
        },
      ],
    }

    const result = assessSymphonyInput(input)

    expect(result.alerts.some(alert => alert.id === 'symphony-pattern-acs-shock')).toBe(true)
    expect(result.alerts.some(alert => alert.source === 'pattern')).toBe(true)
  })
})
