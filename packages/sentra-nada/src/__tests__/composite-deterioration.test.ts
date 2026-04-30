// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import {
  assessSymphonyInput,
  evaluateSymphonyCompositeDeterioration,
  type SymphonyAssessmentInput,
} from '../index'

describe('SYMPHONY composite deterioration', () => {
  it('detects sepsis shock pathway from multiple bedside signals', () => {
    const result = evaluateSymphonyCompositeDeterioration({
      current: {
        observedAt: '2026-04-19T01:00:00.000Z',
        systolicBp: 96,
        diastolicBp: 48,
        heartRate: 118,
        respiratoryRate: 28,
        temperatureC: 39,
        spo2: 95,
        consciousness: 'alert',
        capillaryRefillSec: 4,
      },
      structuredSigns: {
        perfusionShock: {
          coldExtremities: true,
        },
      },
    })

    expect(result.compositeAlerts).toContainEqual(
      expect.objectContaining({
        id: 'composite-sepsis-shock-pathway',
        severity: 'critical',
        confidence: 'high',
      })
    )
    expect(result.derived.shockIndex).toBeGreaterThan(0.9)
    expect(result.derived.map).toBeLessThan(65)
  })

  it('detects respiratory deterioration from encounter SpO2 delta', () => {
    const result = evaluateSymphonyCompositeDeterioration({
      current: {
        observedAt: '2026-04-19T01:00:00.000Z',
        systolicBp: 124,
        diastolicBp: 76,
        heartRate: 112,
        respiratoryRate: 30,
        temperatureC: 37.2,
        spo2: 91,
        consciousness: 'alert',
        oxygenSupplement: true,
      },
      encounterBaseline: {
        computedAt: '2026-04-19T00:00:00.000Z',
        windowMinutes: 120,
        measurements: [
          { observedAt: '2026-04-19T00:00:00.000Z', spo2: 96, respiratoryRate: 22 },
          { observedAt: '2026-04-19T00:30:00.000Z', spo2: 95, respiratoryRate: 23 },
        ],
      },
      structuredSigns: {
        respiratoryDistress: {
          accessoryMuscleUse: true,
        },
      },
    })

    expect(result.compositeAlerts).toContainEqual(
      expect.objectContaining({
        id: 'composite-respiratory-deterioration',
        severity: 'critical',
        confidence: 'high',
      })
    )
    expect(result.derived.deltas.spo2.source).toBe('encounter_window')
    expect(result.derived.deltas.spo2.valueDelta).toBeLessThanOrEqual(-3)
  })

  it('downgrades respiratory deterioration to watcher when encounter baseline is missing', () => {
    const result = evaluateSymphonyCompositeDeterioration({
      current: {
        observedAt: '2026-04-19T01:00:00.000Z',
        systolicBp: 132,
        diastolicBp: 82,
        heartRate: 108,
        respiratoryRate: 27,
        temperatureC: 37,
        spo2: 92,
        consciousness: 'alert',
      },
      structuredSigns: {
        respiratoryDistress: {
          retractions: true,
        },
      },
    })

    expect(result.compositeAlerts.some(alert => alert.id === 'composite-respiratory-deterioration')).toBe(
      false
    )
    expect(result.watchers.some(alert => alert.id === 'watcher-respiratory-deterioration')).toBe(
      true
    )
  })

  it('detects neuro intracranial pathway from Cushing style pattern', () => {
    const result = evaluateSymphonyCompositeDeterioration({
      current: {
        observedAt: '2026-04-19T01:00:00.000Z',
        systolicBp: 196,
        diastolicBp: 118,
        heartRate: 44,
        respiratoryRate: 18,
        temperatureC: 36.8,
        spo2: 97,
        consciousness: 'voice',
      },
      structuredSigns: {
        hmod: {
          severeHeadache: true,
          neurologicalDeficit: true,
        },
      },
    })

    expect(result.compositeAlerts).toContainEqual(
      expect.objectContaining({
        id: 'composite-neuro-intracranial',
        severity: 'critical',
      })
    )
  })

  it('detects silent bleed occult shock using personal HR baseline', () => {
    const result = evaluateSymphonyCompositeDeterioration({
      current: {
        observedAt: '2026-04-19T01:00:00.000Z',
        systolicBp: 108,
        diastolicBp: 84,
        heartRate: 112,
        respiratoryRate: 22,
        temperatureC: 36.8,
        spo2: 97,
        consciousness: 'alert',
        capillaryRefillSec: 4,
      },
      personalBaseline: {
        computedAt: '2026-04-18T00:00:00.000Z',
        visitCount: 3,
        params: {
          heartRate: { mean: 82 },
          systolicBp: { mean: 122 },
        },
      },
      structuredSigns: {
        perfusionShock: {
          coldExtremities: true,
          presyncope: true,
        },
      },
    })

    expect(result.compositeAlerts).toContainEqual(
      expect.objectContaining({
        id: 'composite-silent-bleed-occult-shock',
        confidence: 'high',
      })
    )
  })

  it('injects composite alerts into assessment output', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-composite',
        requestedAt: '2026-04-19T01:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-composite',
        patientRef: 'patient-composite',
        ageYears: 62,
      },
      vitals: [
        {
          observedAt: '2026-04-19T01:00:00.000Z',
          systolicBp: 96,
          diastolicBp: 58,
          heartRate: 118,
          respiratoryRate: 28,
          temperatureC: 39,
          consciousness: 'alert',
          capillaryRefillSec: 4,
        },
      ],
    }

    const result = assessSymphonyInput(input)

    expect(result.alerts.some(alert => alert.id === 'symphony-composite-sepsis-shock-pathway')).toBe(
      true
    )
    expect(result.quality.auditHints).toContain('composite_alert_count:1')
  })
})
