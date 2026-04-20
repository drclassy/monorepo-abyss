import { describe, expect, it } from 'vitest'

import {
  analyzeSymphonyTrajectory,
  assessSymphonyInput,
  buildSymphonyPersonalBaseline,
  type SymphonyAssessmentInput,
} from '../index'

describe('SYMPHONY trajectory, momentum, prediction, and baseline', () => {
  it('detects worsening multi-signal trajectory with sepsis-like acute risk', () => {
    const analysis = analyzeSymphonyTrajectory([
      {
        observedAt: '2026-04-19T00:00:00.000Z',
        systolicBp: 122,
        diastolicBp: 78,
        heartRate: 88,
        respiratoryRate: 18,
        temperatureC: 36.9,
        spo2: 98,
        glucoseMgDl: 118,
        consciousness: 'alert',
      },
      {
        observedAt: '2026-04-19T01:00:00.000Z',
        systolicBp: 108,
        diastolicBp: 68,
        heartRate: 106,
        respiratoryRate: 23,
        temperatureC: 38.4,
        spo2: 95,
        glucoseMgDl: 136,
        consciousness: 'alert',
      },
      {
        observedAt: '2026-04-19T02:00:00.000Z',
        systolicBp: 96,
        diastolicBp: 52,
        heartRate: 122,
        respiratoryRate: 29,
        temperatureC: 39.2,
        spo2: 92,
        glucoseMgDl: 168,
        consciousness: 'voice',
      },
    ])

    expect(analysis.globalDeterioration.state).toBe('critical')
    expect(analysis.acuteAttackRisk24h.sepsisLikeDeteriorationRisk).toBeGreaterThanOrEqual(80)
    expect(analysis.momentum.level).toBe('CRITICAL_MOMENTUM')
    expect(analysis.momentum.convergence.pattern).toBe('sepsis_like')
    expect(analysis.clinicalSafeOutput.riskTier).toBe('critical')
  })

  it('estimates time to critical for a falling systolic trend', () => {
    const analysis = analyzeSymphonyTrajectory([
      {
        observedAt: '2026-04-19T00:00:00.000Z',
        systolicBp: 130,
        heartRate: 84,
        respiratoryRate: 18,
        temperatureC: 36.7,
        spo2: 98,
      },
      {
        observedAt: '2026-04-19T02:00:00.000Z',
        systolicBp: 110,
        heartRate: 96,
        respiratoryRate: 21,
        temperatureC: 37.4,
        spo2: 96,
      },
    ])

    expect(analysis.timeToCriticalEstimate.systolicBpHoursToCritical).toBe(2)
  })

  it('builds personal baseline with current z-score from historical vitals', () => {
    const baseline = buildSymphonyPersonalBaseline(
      [
        { observedAt: '2026-04-17T00:00:00.000Z', heartRate: 80, systolicBp: 120 },
        { observedAt: '2026-04-18T00:00:00.000Z', heartRate: 84, systolicBp: 124 },
        { observedAt: '2026-04-19T00:00:00.000Z', heartRate: 112, systolicBp: 108 },
      ],
      '2026-04-19T00:00:00.000Z'
    )

    expect(baseline.visitCount).toBe(3)
    expect(baseline.params.heartRate?.mean).toBeCloseTo(92, 0)
    expect(baseline.params.heartRate?.currentZScore).toBeGreaterThan(1)
  })

  it('injects trajectory summary into assessment output', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-trajectory',
        requestedAt: '2026-04-19T02:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-trajectory',
        patientRef: 'patient-trajectory',
        ageYears: 61,
      },
      vitals: [
        {
          observedAt: '2026-04-19T00:00:00.000Z',
          systolicBp: 122,
          diastolicBp: 78,
          heartRate: 88,
          respiratoryRate: 18,
          temperatureC: 36.9,
          spo2: 98,
          consciousness: 'alert',
        },
        {
          observedAt: '2026-04-19T01:00:00.000Z',
          systolicBp: 108,
          diastolicBp: 68,
          heartRate: 106,
          respiratoryRate: 23,
          temperatureC: 38.4,
          spo2: 95,
          consciousness: 'alert',
        },
        {
          observedAt: '2026-04-19T02:00:00.000Z',
          systolicBp: 96,
          diastolicBp: 52,
          heartRate: 122,
          respiratoryRate: 29,
          temperatureC: 39.2,
          spo2: 92,
          consciousness: 'voice',
        },
      ],
    }

    const result = assessSymphonyInput(input)

    expect(result.trajectory.direction).toBe('worsening')
    expect(result.trajectory.momentum).toBe('rapid')
    expect(result.trajectory.evidenceRefs).toContain('trajectory_state:critical')
    expect(result.quality.auditHints).toContain('trajectory_state:critical')
  })
})
