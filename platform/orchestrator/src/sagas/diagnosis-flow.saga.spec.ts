import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DiagnosisFlowSaga, type DiagnosisInput } from './diagnosis-flow.saga'
import type { KafkaService } from '../kafka/kafka.service'

function makeKafka(): KafkaService {
  return {
    emit: vi.fn().mockResolvedValue(undefined),
  } as unknown as KafkaService
}

function baseInput(overrides: Partial<DiagnosisInput> = {}): DiagnosisInput {
  return {
    patientId: 'patient-001',
    symptoms: [],
    organizationId: 'org-001',
    requestId: 'req-001',
    ...overrides,
  }
}

describe('DiagnosisFlowSaga (orchestrator → SYMPHONY handoff)', () => {
  let kafka: KafkaService
  let saga: DiagnosisFlowSaga

  beforeEach(() => {
    kafka = makeKafka()
    saga = new DiagnosisFlowSaga(kafka)
  })

  it('runs end-to-end and surfaces SymphonyResult passthrough on output', async () => {
    const result = await saga.execute(
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
    )

    expect(result.symphony).toBeDefined()
    expect(result.symphony.metadata.contractVersion).toBe('0.8.0')
    expect(result.symphony.metadata.status).toBeDefined()
    expect(result.symphony.clinicalDisposition).toBeDefined()
  })

  it('emits CDSS_QUERY kafka event before invoking SYMPHONY', async () => {
    await saga.execute(baseInput({ symptoms: ['demam'] }))
    const calls = (kafka.emit as ReturnType<typeof vi.fn>).mock.calls
    const events = calls.map(call => call[1] as { event?: string }).map(payload => payload?.event)
    expect(events).toContain('CDSS_QUERY')
    expect(events.indexOf('CDSS_QUERY')).toBeLessThan(events.indexOf('AI_PROCESSING'))
  })

  it('does not leak organizationId into SymphonyResult passthrough', async () => {
    const result = await saga.execute(
      baseInput({
        organizationId: 'org-secret-xyz',
        symptoms: ['demam'],
      }),
    )
    expect(JSON.stringify(result.symphony)).not.toContain('org-secret-xyz')
  })

  it('produces empty diagnosis list and zero confidence for empty input (insufficient data path)', async () => {
    const result = await saga.execute(baseInput())
    expect(result.diagnosis).toEqual([])
    expect(result.confidence).toBe(0)
    expect(result.symphony.clinicalDisposition).toBe('insufficient_data')
    expect(result.symphony.metadata.status).toBe('ready')
  })

  it('preserves AADI V2 outputs unchanged where possible (no orchestrator-side reasoning)', async () => {
    const result = await saga.execute(
      baseInput({
        symptoms: ['demam tinggi sesak napas'],
        vitalSigns: { heartRate: 118, respiratoryRate: 26, spo2: 92 },
      }),
    )
    expect(result.symphony.alerts).toBeDefined()
    expect(result.symphony.trajectory).toBeDefined()
    expect(result.symphony.shadowComparison).toBeDefined()
  })

  it('completes deterministically for identical input', async () => {
    const a = await saga.execute(
      baseInput({
        requestId: 'req-determ',
        symptoms: ['demam'],
        vitalSigns: { heartRate: 100 },
      }),
    )
    const b = await saga.execute(
      baseInput({
        requestId: 'req-determ',
        symptoms: ['demam'],
        vitalSigns: { heartRate: 100 },
      }),
    )
    expect(a.symphony.metadata.contractVersion).toBe(b.symphony.metadata.contractVersion)
    expect(a.symphony.clinicalDisposition).toBe(b.symphony.clinicalDisposition)
    expect(a.symphony.alerts.length).toBe(b.symphony.alerts.length)
  })
})
