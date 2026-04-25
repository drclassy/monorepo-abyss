import { Injectable } from '@nestjs/common';
import { BaseSaga } from './base.saga';
import { KafkaService } from '../kafka/kafka.service';

export interface DiagnosisInput {
  patientId: string;
  symptoms: string[];
  vitalSigns?: Record<string, number>;
  organizationId: string;
  requestId: string;
}

export interface DiagnosisOutput {
  requestId: string;
  diagnosis: string[];
  confidence: number;
  cdssRecommendations: string[];
  aiProcessingId: string;
  completedAt: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delayMs = RETRY_DELAY_MS,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

@Injectable()
export class DiagnosisFlowSaga extends BaseSaga<DiagnosisInput, DiagnosisOutput> {
  constructor(private readonly kafka: KafkaService) {
    super();
    this.buildSteps();
  }

  private buildSteps(): void {
    // Step 1: DIAGNOSIS_REQUESTED — validate and emit event
    this.addStep({
      name: 'DIAGNOSIS_REQUESTED',
      invoke: async (input: DiagnosisInput) => {
        await this.kafka.emit('diagnosis-events', {
          event: 'DIAGNOSIS_REQUESTED',
          requestId: input.requestId,
          patientId: input.patientId,
          organizationId: input.organizationId,
          timestamp: new Date().toISOString(),
        });
        return input;
      },
      compensate: async (input: DiagnosisInput, error: Error) => {
        await this.emitDlq('DIAGNOSIS_REQUESTED', input, error);
      },
    });

    // Step 2: CDSS_QUERY — query Clinical Decision Support System
    this.addStep({
      name: 'CDSS_QUERY',
      invoke: async (input: DiagnosisInput) => {
        await this.kafka.emit('diagnosis-events', {
          event: 'CDSS_QUERY',
          requestId: input.requestId,
          symptoms: input.symptoms,
          vitalSigns: input.vitalSigns,
          timestamp: new Date().toISOString(),
        });

        // CDSS query with retry logic
        const cdssResult = await withRetry(async () => {
          // TODO: replace with real @the-abyss/symphony diagnosis call when orchestration wiring is active
          return {
            primaryDiagnosis: [`${input.symptoms[0] ?? 'unknown'}-related condition`],
            differentials: [],
            recommendations: ['Monitor vital signs', 'Follow-up in 24h'],
            confidence: 0.82,
          };
        });

        return { ...input, cdssResult };
      },
      compensate: async (input: DiagnosisInput, error: Error) => {
        await this.emitDlq('CDSS_QUERY', input, error);
      },
    });

    // Step 3: AI_PROCESSING — run through LangFlow / LLM pipeline
    this.addStep({
      name: 'AI_PROCESSING',
      invoke: async (input: any) => {
        await this.kafka.emit('diagnosis-events', {
          event: 'AI_PROCESSING',
          requestId: input.requestId,
          timestamp: new Date().toISOString(),
        });

        // AI processing with retry logic
        const aiResult = await withRetry(async () => {
          // TODO: replace with real @the-abyss/langflow-client call when Phase B is active
          const aiProcessingId = `ai-${input.requestId}-${Date.now()}`;
          return {
            aiProcessingId,
            enhancedDiagnosis: input.cdssResult?.primaryDiagnosis ?? [],
            confidence: input.cdssResult?.confidence ?? 0,
            aiRecommendations: input.cdssResult?.recommendations ?? [],
          };
        });

        return { ...input, aiResult };
      },
      compensate: async (input: any, error: Error) => {
        await this.emitDlq('AI_PROCESSING', input, error);
      },
    });

    // Step 4: RESPONSE_EMIT — emit final result to Kafka
    this.addStep({
      name: 'RESPONSE_EMIT',
      invoke: async (input: any): Promise<DiagnosisOutput> => {
        const output: DiagnosisOutput = {
          requestId: input.requestId,
          diagnosis: input.aiResult?.enhancedDiagnosis ?? [],
          confidence: input.aiResult?.confidence ?? 0,
          cdssRecommendations: input.aiResult?.aiRecommendations ?? [],
          aiProcessingId: input.aiResult?.aiProcessingId ?? '',
          completedAt: new Date().toISOString(),
        };

        await this.kafka.emit('diagnosis-events', {
          event: 'RESPONSE_EMIT',
          requestId: input.requestId,
          result: output,
          timestamp: output.completedAt,
        });

        return output;
      },
      compensate: async (input: any, error: Error) => {
        await this.emitDlq('RESPONSE_EMIT', input, error);
      },
    });
  }

  private async emitDlq(
    step: string,
    input: unknown,
    error: Error,
  ): Promise<void> {
    await this.kafka.emit('diagnosis-dlq', {
      step,
      input,
      error: error.message,
      timestamp: new Date().toISOString(),
    }).catch((dlqErr) => {
      console.error('[DiagnosisFlowSaga] DLQ emit failed:', dlqErr);
    });
  }
}
