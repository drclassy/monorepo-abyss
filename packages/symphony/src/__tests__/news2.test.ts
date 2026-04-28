import { describe, expect, it } from 'vitest'

import {
  assessSymphonyInput,
  calculateSymphonyNEWS2,
  news2ToSymphonyAlerts,
  type SymphonyAssessmentInput,
} from '../index'

describe('SYMPHONY NEWS2 parity slice', () => {
  it('matches the Dashboard NEWS2 high-risk scoring shape for complete adult vitals', () => {
    const result = calculateSymphonyNEWS2({
      vitals: {
        observedAt: '2026-04-18T00:00:00.000Z',
        respiratoryRate: 26,
        spo2: 88,
        systolicBp: 86,
        heartRate: 132,
        temperatureC: 39.5,
        oxygenSupplement: true,
        consciousness: 'voice',
      },
    })

    expect(result.aggregateScore).toBe(19)
    expect(result.riskLevel).toBe('high')
    expect(result.hasExtremeSingle).toBe(true)
    expect(result.scoreableParameters).toBe(7)
  })

  it('uses NEWS2 SpO2 Scale 2 for COPD or hypercapnic risk contexts', () => {
    const result = calculateSymphonyNEWS2({
      hasCOPD: true,
      vitals: {
        observedAt: '2026-04-18T00:00:00.000Z',
        spo2: 97,
      },
    })

    expect(result.parameterScores).toContainEqual({
      parameter: 'spo2_scale2',
      value: 97,
      score: 3,
      unit: '%',
    })
    expect(result.riskLevel).toBe('low_medium')
  })

  it('converts medium-or-higher NEWS2 output into SYMPHONY alerts', () => {
    const result = calculateSymphonyNEWS2({
      vitals: {
        observedAt: '2026-04-18T00:00:00.000Z',
        respiratoryRate: 25,
        spo2: 91,
      },
    })

    const alerts = news2ToSymphonyAlerts(result, '2026-04-18T00:00:00.000Z')

    expect(alerts).toHaveLength(1)
    expect(alerts[0]?.severity).toBe('high')
    expect(alerts[0]?.source).toBe('news2')
    expect(alerts[0]?.title).toContain('NEWS2')
  })

  it('injects NEWS2 and hard vital alerts into the scaffolded assessment result', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-news2',
        requestedAt: '2026-04-18T00:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-news2',
        patientRef: 'patient-news2',
      },
      vitals: [
        {
          observedAt: '2026-04-18T00:00:00.000Z',
          systolicBp: 184,
          diastolicBp: 122,
          respiratoryRate: 32,
          spo2: 89,
          consciousness: 'alert',
        },
      ],
    }

    const result = assessSymphonyInput(input)

    expect(result.alerts.some(alert => alert.source === 'news2')).toBe(true)
    expect(result.alerts.some(alert => alert.id === 'symphony-vitals-hypertensive-crisis')).toBe(
      true
    )
    expect(result.alerts.some(alert => alert.id === 'symphony-vitals-severe-hypoxemia')).toBe(true)
    expect(result.quality.auditHints).toContain('news2_score:6')
  })

  it("consciousness 'unknown' scores 3 — conservative safety default, not zero", () => {
    const result = calculateSymphonyNEWS2({
      vitals: {
        observedAt: '2026-04-28T00:00:00.000Z',
        consciousness: 'unknown',
      },
    })
    const param = result.parameterScores.find(p => p.parameter === 'consciousness')
    expect(param?.score).toBe(3)
  })

  it("consciousness undefined is excluded from parameterScores and adds 0 to aggregate (no penalty)", () => {
    const withUndefined = calculateSymphonyNEWS2({
      vitals: { observedAt: '2026-04-28T00:00:00.000Z' },
    })
    const withUnknown = calculateSymphonyNEWS2({
      vitals: { observedAt: '2026-04-28T00:00:00.000Z', consciousness: 'unknown' },
    })
    // undefined is filtered from parameterScores (value === undefined exclusion)
    expect(withUndefined.parameterScores.find(p => p.parameter === 'consciousness')).toBeUndefined()
    // 'unknown' adds 3 to aggregate; undefined adds 0 — difference documents the no-penalty behavior
    expect(withUnknown.aggregateScore - withUndefined.aggregateScore).toBe(3)
  })
})
