import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { KafkaService } from '../kafka/kafka.service'

import { ReferralFlowSaga, type ReferralInput } from './referral-flow.saga'

function makeKafka(
  impl?: (topic: string, payload: Record<string, unknown>) => Promise<void> | void
): KafkaService {
  return {
    emit: vi.fn().mockImplementation(async (topic: string, payload: Record<string, unknown>) => {
      await impl?.(topic, payload)
    }),
  } as unknown as KafkaService
}

function baseInput(overrides: Partial<ReferralInput> = {}): ReferralInput {
  return {
    patientId: 'patient-001',
    sourceOrganizationId: 'org-source',
    destinationOrganizationId: 'org-destination',
    referralReason: 'Sesak napas progresif',
    urgency: 'urgent',
    referralId: 'ref-001',
    diagnosisCode: 'J18.9',
    ...overrides,
  }
}

describe('ReferralFlowSaga', () => {
  let kafka: KafkaService
  let saga: ReferralFlowSaga

  beforeEach(() => {
    kafka = makeKafka()
    saga = new ReferralFlowSaga(kafka)
  })

  it('completes successfully and returns referral confirmation output', async () => {
    const result = await saga.execute(baseInput())

    expect(result.referralId).toBe('ref-001')
    expect(result.status).toBe('confirmed')
    expect(result.confirmationCode).toContain('REF-ref-001-')
  })

  it('emitDlq publishes a PHI-safe envelope when a referral step fails', async () => {
    const failingKafka = makeKafka(async (topic, payload) => {
      if (topic === 'referral-events' && payload.event === 'NOTIFY_DESTINATION') {
        throw new Error('SECRET-REFERRAL-NARRATIVE: patient unstable')
      }
    })
    const failingSaga = new ReferralFlowSaga(failingKafka)

    await expect(
      failingSaga.execute(
        baseInput({
          patientId: 'patient-secret-001',
          referralReason: 'SECRET-REFERRAL-NARRATIVE: patient unstable',
          referralId: 'ref-dlq-001',
        })
      )
    ).rejects.toThrow('SECRET-REFERRAL-NARRATIVE: patient unstable')

    const calls = (failingKafka.emit as ReturnType<typeof vi.fn>).mock.calls
    const dlqCall = calls.find((call) => call[0] === 'referral-dlq')
    expect(dlqCall).toBeDefined()

    const dlqPayload = dlqCall?.[1] as Record<string, unknown>
    expect(Object.keys(dlqPayload).sort()).toEqual(
      ['errorName', 'errorType', 'referralId', 'step', 'timestamp'].sort()
    )
    expect(dlqPayload.referralId).toBe('ref-dlq-001')

    const serialized = JSON.stringify(dlqPayload)
    expect(serialized).not.toContain('SECRET-REFERRAL-NARRATIVE')
    expect(serialized).not.toContain('patient-secret-001')
    expect(serialized).not.toContain('org-source')
  })

  it('records compensation emit failures explicitly instead of swallowing them', async () => {
    const failingKafka = makeKafka(async (topic, payload) => {
      if (topic === 'referral-events' && payload.event === 'NOTIFY_DESTINATION') {
        throw new Error('PrimaryFailure')
      }

      if (topic === 'referral-events' && payload.event === 'DESTINATION_UNAVAILABLE') {
        throw new Error('CompensationFailure')
      }
    })
    const failingSaga = new ReferralFlowSaga(failingKafka)

    await expect(failingSaga.execute(baseInput({ referralId: 'ref-comp-001' }))).rejects.toThrow(
      'PrimaryFailure'
    )

    const dlqPayloads = (failingKafka.emit as ReturnType<typeof vi.fn>).mock.calls
      .filter((call) => call[0] === 'referral-dlq')
      .map((call) => call[1] as Record<string, unknown>)

    expect(dlqPayloads.some((payload) => payload.step === 'VALIDATE_DESTINATION')).toBe(true)
    expect(dlqPayloads.some((payload) => payload.step === 'DESTINATION_UNAVAILABLE_EMIT')).toBe(
      true
    )
  })
})
