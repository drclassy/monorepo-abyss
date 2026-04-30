import { describe, expect, it } from 'vitest'
import { assessSymphonyInput } from '@sentra/nada'

import {
  mapDiagnosisInputToSymphonyInput,
  mapSymphonyResultToCdssResult,
  type DiagnosisSagaInput,
} from './symphony-bridge'

const FROZEN_NOW = '2026-04-27T12:00:00.000Z'
const frozenNow = () => FROZEN_NOW

function baseInput(overrides: Partial<DiagnosisSagaInput> = {}): DiagnosisSagaInput {
  return {
    patientId: 'patient-001',
    symptoms: [],
    organizationId: 'org-001',
    requestId: 'req-001',
    ...overrides,
  }
}

describe('mapDiagnosisInputToSymphonyInput', () => {
  it('builds a deterministic SymphonyAssessmentInput with system caller', () => {
    const result = mapDiagnosisInputToSymphonyInput(baseInput(), frozenNow)
    expect(result.metadata).toEqual({
      requestId: 'req-001',
      requestedAt: FROZEN_NOW,
      caller: 'system',
    })
    expect(result.patientContext.patientRef).toBe('patient-001')
    expect(result.patientContext.encounterId).toBe('enc-req-001')
    expect(result.vitals).toEqual([])
    expect(result.chiefComplaint).toBeUndefined()
  })

  it('joins symptoms into chiefComplaint when present', () => {
    const result = mapDiagnosisInputToSymphonyInput(
      baseInput({ symptoms: ['demam', 'sesak napas'] }),
      frozenNow,
    )
    expect(result.chiefComplaint).toBe('demam; sesak napas')
  })

  it('promotes flat numeric vitalSigns into a single SymphonyVitalsInput snapshot', () => {
    const result = mapDiagnosisInputToSymphonyInput(
      baseInput({
        vitalSigns: {
          heartRate: 110,
          respiratoryRate: 24,
          systolicBp: 110,
          spo2: 92,
        },
      }),
      frozenNow,
    )
    expect(result.vitals).toHaveLength(1)
    expect(result.vitals[0]).toEqual({
      observedAt: FROZEN_NOW,
      heartRate: 110,
      respiratoryRate: 24,
      systolicBp: 110,
      spo2: 92,
    })
  })

  it('drops unknown vital keys and non-finite numbers', () => {
    const result = mapDiagnosisInputToSymphonyInput(
      baseInput({
        vitalSigns: {
          heartRate: 80,
          notARealVital: 999,
          spo2: Number.NaN,
        },
      }),
      frozenNow,
    )
    expect(result.vitals).toEqual([{ observedAt: FROZEN_NOW, heartRate: 80 }])
  })

  it('omits vitals array entry when no recognized vital is present', () => {
    const result = mapDiagnosisInputToSymphonyInput(
      baseInput({
        vitalSigns: { irrelevant: 1 },
      }),
      frozenNow,
    )
    expect(result.vitals).toEqual([])
  })

  it('respects an explicit requestedAt override', () => {
    const result = mapDiagnosisInputToSymphonyInput(
      baseInput({ requestedAt: '2025-01-01T00:00:00.000Z' }),
      frozenNow,
    )
    expect(result.metadata.requestedAt).toBe('2025-01-01T00:00:00.000Z')
  })

  it('does not leak organizationId into Symphony input', () => {
    const result = mapDiagnosisInputToSymphonyInput(
      baseInput({ organizationId: 'org-secret-xyz' }),
      frozenNow,
    )
    expect(JSON.stringify(result)).not.toContain('org-secret-xyz')
  })

  it('produces the same SymphonyAssessmentInput for the same input (determinism)', () => {
    const input = baseInput({
      symptoms: ['demam'],
      vitalSigns: { heartRate: 100 },
    })
    expect(mapDiagnosisInputToSymphonyInput(input, frozenNow)).toEqual(
      mapDiagnosisInputToSymphonyInput(input, frozenNow),
    )
  })
})

describe('mapSymphonyResultToCdssResult', () => {
  it('flattens top hypothesis into legacy CDSS result fields and passes through full SymphonyResult', () => {
    const result = assessSymphonyInput(
      mapDiagnosisInputToSymphonyInput(
        baseInput({
          symptoms: ['demam tinggi sesak napas'],
          vitalSigns: {
            heartRate: 118,
            respiratoryRate: 26,
            systolicBp: 110,
            temperatureC: 39.1,
            spo2: 92,
          },
        }),
        frozenNow,
      ),
    )
    const cdss = mapSymphonyResultToCdssResult(result)
    expect(cdss.symphony).toBe(result)
    expect(Array.isArray(cdss.primaryDiagnosis)).toBe(true)
    expect(Array.isArray(cdss.differentials)).toBe(true)
    expect(Array.isArray(cdss.recommendations)).toBe(true)
    expect(cdss.confidence).toBeGreaterThanOrEqual(0)
    expect(cdss.confidence).toBeLessThanOrEqual(1)
  })

  it('returns empty primary and zero confidence when no native hypotheses are produced', () => {
    const result = assessSymphonyInput(
      mapDiagnosisInputToSymphonyInput(baseInput(), frozenNow),
    )
    const cdss = mapSymphonyResultToCdssResult(result)
    expect(cdss.primaryDiagnosis).toEqual([])
    expect(cdss.differentials).toEqual([])
    expect(cdss.confidence).toBe(0)
    expect(cdss.symphony).toBe(result)
  })
})
