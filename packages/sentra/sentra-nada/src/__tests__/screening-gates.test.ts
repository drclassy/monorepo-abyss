// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  assessSymphonyInput,
  evaluateSymphonyInstantScreeningGates,
  type SymphonyAssessmentInput,
} from '../index'

describe('SYMPHONY instant screening gates', () => {
  it('detects glucose crisis gates', () => {
    const alerts = evaluateSymphonyInstantScreeningGates({
      latestVitals: {
        observedAt: '2026-04-19T00:00:00.000Z',
        glucoseMgDl: 48,
      },
    })

    expect(alerts).toContainEqual(
      expect.objectContaining({
        id: 'symphony-gate-glucose-severe-hypoglycemia',
        severity: 'critical',
        source: 'safety_gate',
        gate: 'GATE_3_GLUCOSE',
      })
    )
  })

  it('detects occult shock from MAP and shock index', () => {
    const alerts = evaluateSymphonyInstantScreeningGates({
      latestVitals: {
        observedAt: '2026-04-19T00:00:00.000Z',
        systolicBp: 82,
        diastolicBp: 48,
        heartRate: 128,
      },
    })

    expect(alerts.some(alert => alert.id === 'symphony-gate-shock-map-low')).toBe(true)
    expect(alerts.some(alert => alert.id === 'symphony-gate-shock-index')).toBe(true)
  })

  it('detects qSOFA and respiratory gates with critical escalation semantics', () => {
    const alerts = evaluateSymphonyInstantScreeningGates({
      latestVitals: {
        observedAt: '2026-04-19T00:00:00.000Z',
        systolicBp: 94,
        respiratoryRate: 24,
        spo2: 92,
        oxygenSupplement: true,
        consciousness: 'voice',
      },
    })

    expect(alerts).toContainEqual(
      expect.objectContaining({
        id: 'symphony-gate-sepsis-qsofa',
        severity: 'critical',
        gate: 'GATE_5_SEPSIS',
      })
    )
    expect(alerts.some(alert => alert.id === 'symphony-gate-respiratory-tachypnea')).toBe(true)
    expect(alerts.some(alert => alert.id === 'symphony-gate-respiratory-hypoxemia')).toBe(true)
    expect(alerts.some(alert => alert.id === 'symphony-gate-respiratory-low-spo2-on-oxygen')).toBe(
      true
    )
  })

  it('detects pediatric abnormal vital gates from age band', () => {
    const alerts = evaluateSymphonyInstantScreeningGates({
      ageMonths: 18,
      latestVitals: {
        observedAt: '2026-04-19T00:00:00.000Z',
        systolicBp: 82,
        heartRate: 150,
        respiratoryRate: 36,
      },
    })

    expect(alerts.some(alert => alert.id === 'symphony-gate-pediatric-sbp-low')).toBe(true)
    expect(alerts.some(alert => alert.id === 'symphony-gate-pediatric-hr')).toBe(true)
    expect(alerts.some(alert => alert.id === 'symphony-gate-pediatric-rr')).toBe(true)
  })

  it('detects obstetric severe hypertension gate and injects it into assessment output', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-obstetric',
        requestedAt: '2026-04-19T00:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-obstetric',
        patientRef: 'patient-obstetric',
        ageYears: 30,
        sexAtBirth: 'female',
        pregnancyStatus: 'pregnant',
      },
      vitals: [
        {
          observedAt: '2026-04-19T00:00:00.000Z',
          systolicBp: 164,
          diastolicBp: 112,
          heartRate: 126,
          glucoseMgDl: 48,
        },
      ],
    }

    const result = assessSymphonyInput(input)

    expect(
      result.alerts.some(alert => alert.id === 'symphony-gate-obstetric-severe-hypertension')
    ).toBe(true)
    expect(result.alerts.some(alert => alert.id === 'symphony-gate-obstetric-tachycardia')).toBe(
      true
    )
    expect(
      result.alerts.some(alert => alert.id === 'symphony-gate-glucose-severe-hypoglycemia')
    ).toBe(true)
  })
})
