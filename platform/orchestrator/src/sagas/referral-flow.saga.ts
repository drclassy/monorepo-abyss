import { Injectable } from '@nestjs/common'

import type { KafkaService } from '../kafka/kafka.service'

import { BaseSaga } from './base.saga'

export interface ReferralInput {
  patientId: string
  sourceOrganizationId: string
  destinationOrganizationId: string
  referralReason: string
  urgency: 'routine' | 'urgent' | 'emergency'
  referralId: string
  diagnosisCode?: string
}

export interface ReferralOutput {
  referralId: string
  status: 'confirmed' | 'failed'
  confirmationCode?: string
  destinationContact?: string
  estimatedResponseHours: number
  completedAt: string
}

interface ReferralPatientState extends ReferralInput {
  patientMrn: string
}

interface DestinationValidation {
  contact: string
  estimatedResponseHours: number
}

interface ReferralDestinationState extends ReferralPatientState {
  destValidation: DestinationValidation
}

interface ReferralNotificationState extends ReferralDestinationState {
  confirmationCode: string
}

const REFERRAL_TIMEOUT_MS = 30_000
const URGENT_TIMEOUT_MS = 10_000

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  return new Error(typeof error === 'string' ? error : 'Unknown referral saga error')
}

function getTimeoutMs(urgency: ReferralInput['urgency']): number {
  return urgency === 'emergency' || urgency === 'urgent' ? URGENT_TIMEOUT_MS : REFERRAL_TIMEOUT_MS
}

async function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Step timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ])
}

@Injectable()
export class ReferralFlowSaga extends BaseSaga<ReferralInput, ReferralOutput> {
  constructor(private readonly kafka: KafkaService) {
    super()
    this.buildSteps()
  }

  private buildSteps(): void {
    // Step 1: REFERRAL_INITIATED — log and emit initiation event
    this.addStep({
      name: 'REFERRAL_INITIATED',
      invoke: async (input: ReferralInput) => {
        await this.kafka.emit('referral-events', {
          event: 'REFERRAL_INITIATED',
          referralId: input.referralId,
          sourceOrg: input.sourceOrganizationId,
          destinationOrg: input.destinationOrganizationId,
          urgency: input.urgency,
          timestamp: new Date().toISOString(),
        })
        return input
      },
      compensate: async (input: ReferralInput, error: Error) => {
        await this.emitDlq('REFERRAL_INITIATED', input.referralId, error)
        // No compensation needed — initiation hasn't committed anything
      },
    })

    // Step 2: VALIDATE_PATIENT — verify patient eligibility for referral
    this.addStep({
      name: 'VALIDATE_PATIENT',
      invoke: async (input: ReferralInput) => {
        const timeout = getTimeoutMs(input.urgency)

        const validation = await withTimeout(async () => {
          // TODO: replace with real patient validation via @the-abyss/database
          return { valid: true, mrn: `PKM-${input.patientId}` }
        }, timeout)

        if (!validation.valid) {
          throw new Error(`Patient ${input.patientId} not eligible for referral`)
        }

        await this.kafka.emit('referral-events', {
          event: 'VALIDATE_PATIENT',
          referralId: input.referralId,
          patientMrn: validation.mrn,
          timestamp: new Date().toISOString(),
        })

        return { ...input, patientMrn: validation.mrn }
      },
      compensate: async (input: ReferralInput | ReferralPatientState, error: Error) => {
        await this.emitDlq('VALIDATE_PATIENT', input.referralId, error)
      },
    })

    // Step 3: VALIDATE_DESTINATION — verify receiving facility can accept
    this.addStep({
      name: 'VALIDATE_DESTINATION',
      invoke: async (input: ReferralPatientState): Promise<ReferralDestinationState> => {
        const timeout = getTimeoutMs(input.urgency)

        const destValidation = await withTimeout(async () => {
          // TODO: replace with real facility capacity check
          return {
            available: true,
            contact: `admin@${input.destinationOrganizationId}.sentra.id`,
            estimatedResponseHours: input.urgency === 'emergency' ? 1 : 24,
          }
        }, timeout)

        if (!destValidation.available) {
          throw new Error(`Destination ${input.destinationOrganizationId} is not available`)
        }

        await this.kafka.emit('referral-events', {
          event: 'VALIDATE_DESTINATION',
          referralId: input.referralId,
          destinationContact: destValidation.contact,
          timestamp: new Date().toISOString(),
        })

        return {
          ...input,
          destValidation: {
            contact: destValidation.contact,
            estimatedResponseHours: destValidation.estimatedResponseHours,
          },
        }
      },
      compensate: async (input: ReferralPatientState, error: Error) => {
        await this.emitDlq('VALIDATE_DESTINATION', input.referralId, error)
        await this.emitCompensationEvent('DESTINATION_UNAVAILABLE', input.referralId, error)
      },
    })

    // Step 4: NOTIFY_DESTINATION — send referral packet to receiving facility
    this.addStep({
      name: 'NOTIFY_DESTINATION',
      invoke: async (input: ReferralDestinationState): Promise<ReferralNotificationState> => {
        const confirmationCode = `REF-${input.referralId}-${Date.now()}`

        await this.kafka.emit('referral-events', {
          event: 'NOTIFY_DESTINATION',
          referralId: input.referralId,
          confirmationCode,
          destinationOrg: input.destinationOrganizationId,
          patientMrn: input.patientMrn,
          referralReason: input.referralReason,
          diagnosisCode: input.diagnosisCode,
          urgency: input.urgency,
          timestamp: new Date().toISOString(),
        })

        return { ...input, confirmationCode }
      },
      compensate: async (
        input: ReferralDestinationState | ReferralNotificationState,
        error: Error
      ) => {
        await this.emitDlq('NOTIFY_DESTINATION', input.referralId, error)
        await this.emitCompensationEvent('NOTIFY_CANCELLED', input.referralId, error)
      },
    })

    // Step 5: CONFIRM_RECEIPT — finalize and emit confirmation to source
    this.addStep({
      name: 'CONFIRM_RECEIPT',
      invoke: async (input: ReferralNotificationState): Promise<ReferralOutput> => {
        const output: ReferralOutput = {
          referralId: input.referralId,
          status: 'confirmed',
          confirmationCode: input.confirmationCode,
          destinationContact: input.destValidation?.contact,
          estimatedResponseHours: input.destValidation?.estimatedResponseHours ?? 24,
          completedAt: new Date().toISOString(),
        }

        await this.kafka.emit('referral-events', {
          event: 'CONFIRM_RECEIPT',
          referralId: input.referralId,
          result: output,
          timestamp: output.completedAt,
        })

        return output
      },
      compensate: async (input: ReferralNotificationState, error: Error) => {
        await this.emitDlq('CONFIRM_RECEIPT', input.referralId, error)
        await this.emitCompensationEvent('REFERRAL_FAILED', input.referralId, error)
      },
    })
  }

  private async emitCompensationEvent(
    event: 'DESTINATION_UNAVAILABLE' | 'NOTIFY_CANCELLED' | 'REFERRAL_FAILED',
    referralId: string,
    error: Error
  ): Promise<void> {
    try {
      await this.kafka.emit('referral-events', {
        event,
        referralId,
        reason: error.name,
        timestamp: new Date().toISOString(),
      })
    } catch (emitError) {
      const normalizedError = normalizeError(emitError)
      await this.emitDlq(`${event}_EMIT`, referralId, normalizedError)
      throw normalizedError
    }
  }

  private async emitDlq(step: string, referralId: string, error: Error): Promise<void> {
    await this.kafka
      .emit('referral-dlq', {
        step,
        referralId,
        errorType: error.constructor.name,
        errorName: error.name,
        timestamp: new Date().toISOString(),
      })
      .catch((dlqErr) => {
        console.error('[ReferralFlowSaga] DLQ emit failed:', normalizeError(dlqErr).name)
      })
  }
}
