import { Injectable } from '@nestjs/common';
import { BaseSaga } from './base.saga';
import { KafkaService } from '../kafka/kafka.service';

export interface ReferralInput {
  patientId: string;
  sourceOrganizationId: string;
  destinationOrganizationId: string;
  referralReason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  referralId: string;
  diagnosisCode?: string;
}

export interface ReferralOutput {
  referralId: string;
  status: 'confirmed' | 'failed';
  confirmationCode?: string;
  destinationContact?: string;
  estimatedResponseHours: number;
  completedAt: string;
}

const REFERRAL_TIMEOUT_MS = 30_000; // 30 seconds per step
const URGENT_TIMEOUT_MS = 10_000;

function getTimeoutMs(urgency: ReferralInput['urgency']): number {
  return urgency === 'emergency' || urgency === 'urgent'
    ? URGENT_TIMEOUT_MS
    : REFERRAL_TIMEOUT_MS;
}

async function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Step timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

@Injectable()
export class ReferralFlowSaga extends BaseSaga<ReferralInput, ReferralOutput> {
  constructor(private readonly kafka: KafkaService) {
    super();
    this.buildSteps();
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
        });
        return input;
      },
      compensate: async (input: ReferralInput, error: Error) => {
        await this.emitDlq('REFERRAL_INITIATED', input, error);
        // No compensation needed — initiation hasn't committed anything
      },
    });

    // Step 2: VALIDATE_PATIENT — verify patient eligibility for referral
    this.addStep({
      name: 'VALIDATE_PATIENT',
      invoke: async (input: ReferralInput) => {
        const timeout = getTimeoutMs(input.urgency);

        const validation = await withTimeout(async () => {
          // TODO: replace with real patient validation via @the-abyss/database
          return { valid: true, mrn: `PKM-${input.patientId}` };
        }, timeout);

        if (!validation.valid) {
          throw new Error(`Patient ${input.patientId} not eligible for referral`);
        }

        await this.kafka.emit('referral-events', {
          event: 'VALIDATE_PATIENT',
          referralId: input.referralId,
          patientMrn: validation.mrn,
          timestamp: new Date().toISOString(),
        });

        return { ...input, patientMrn: validation.mrn };
      },
      compensate: async (input: ReferralInput, error: Error) => {
        await this.emitDlq('VALIDATE_PATIENT', input, error);
      },
    });

    // Step 3: VALIDATE_DESTINATION — verify receiving facility can accept
    this.addStep({
      name: 'VALIDATE_DESTINATION',
      invoke: async (input: any) => {
        const timeout = getTimeoutMs(input.urgency);

        const destValidation = await withTimeout(async () => {
          // TODO: replace with real facility capacity check
          return {
            available: true,
            contact: `admin@${input.destinationOrganizationId}.sentra.id`,
            estimatedResponseHours: input.urgency === 'emergency' ? 1 : 24,
          };
        }, timeout);

        if (!destValidation.available) {
          throw new Error(`Destination ${input.destinationOrganizationId} is not available`);
        }

        await this.kafka.emit('referral-events', {
          event: 'VALIDATE_DESTINATION',
          referralId: input.referralId,
          destinationContact: destValidation.contact,
          timestamp: new Date().toISOString(),
        });

        return { ...input, destValidation };
      },
      compensate: async (input: any, error: Error) => {
        // Compensating transaction: notify source org that destination unavailable
        await this.kafka.emit('referral-events', {
          event: 'DESTINATION_UNAVAILABLE',
          referralId: input.referralId,
          reason: error.message,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        await this.emitDlq('VALIDATE_DESTINATION', input, error);
      },
    });

    // Step 4: NOTIFY_DESTINATION — send referral packet to receiving facility
    this.addStep({
      name: 'NOTIFY_DESTINATION',
      invoke: async (input: any) => {
        const confirmationCode = `REF-${input.referralId}-${Date.now()}`;

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
        });

        return { ...input, confirmationCode };
      },
      compensate: async (input: any, error: Error) => {
        // Compensating transaction: cancel notification if already sent
        await this.kafka.emit('referral-events', {
          event: 'NOTIFY_CANCELLED',
          referralId: input.referralId,
          reason: error.message,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        await this.emitDlq('NOTIFY_DESTINATION', input, error);
      },
    });

    // Step 5: CONFIRM_RECEIPT — finalize and emit confirmation to source
    this.addStep({
      name: 'CONFIRM_RECEIPT',
      invoke: async (input: any): Promise<ReferralOutput> => {
        const output: ReferralOutput = {
          referralId: input.referralId,
          status: 'confirmed',
          confirmationCode: input.confirmationCode,
          destinationContact: input.destValidation?.contact,
          estimatedResponseHours: input.destValidation?.estimatedResponseHours ?? 24,
          completedAt: new Date().toISOString(),
        };

        await this.kafka.emit('referral-events', {
          event: 'CONFIRM_RECEIPT',
          referralId: input.referralId,
          result: output,
          timestamp: output.completedAt,
        });

        return output;
      },
      compensate: async (input: any, error: Error) => {
        // Emit failed referral event so source org is notified
        await this.kafka.emit('referral-events', {
          event: 'REFERRAL_FAILED',
          referralId: input.referralId,
          reason: error.message,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        await this.emitDlq('CONFIRM_RECEIPT', input, error);
      },
    });
  }

  private async emitDlq(
    step: string,
    input: unknown,
    error: Error,
  ): Promise<void> {
    await this.kafka.emit('referral-dlq', {
      step,
      input,
      error: error.message,
      timestamp: new Date().toISOString(),
    }).catch((dlqErr) => {
      console.error('[ReferralFlowSaga] DLQ emit failed:', dlqErr);
    });
  }
}
