import { Injectable } from '@nestjs/common';
import { assessSymphonyInput, type SymphonyResult } from '@sentra/nada';
import { BaseSaga } from './base.saga';
import { KafkaService } from '../kafka/kafka.service';
import {
  mapDiagnosisInputToSymphonyInput,
  mapSymphonyResultToCdssResult,
  type DiagnosisCdssResult,
} from './symphony-bridge';

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
  symphony: SymphonyResult;
}

interface DiagnosisCdssState extends DiagnosisInput {
  cdssResult: DiagnosisCdssResult;
}

interface DiagnosisAiResult {
  aiProcessingId: string;
  enhancedDiagnosis: string[];
  confidence: number;
  aiRecommendations: string[];
}

interface DiagnosisAiState extends DiagnosisCdssState {
  aiResult: DiagnosisAiResult;
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
        await this.emitDlq('DIAGNOSIS_REQUESTED', input.requestId, error);
      },
    });

    // Step 2: CDSS_QUERY — query SYMPHONY clinical reasoning engine.
    // SYMPHONY is the only reasoning authority; orchestrator is a thin caller.
    this.addStep({
      name: 'CDSS_QUERY',
      invoke: async (input: DiagnosisInput): Promise<DiagnosisCdssState> => {
        await this.kafka.emit('diagnosis-events', {
          event: 'CDSS_QUERY',
          requestId: input.requestId,
          symptoms: input.symptoms,
          vitalSigns: input.vitalSigns,
          timestamp: new Date().toISOString(),
        });

        const symphonyInput = mapDiagnosisInputToSymphonyInput(input);
        const symphonyResult = assessSymphonyInput(symphonyInput);
        const cdssResult: DiagnosisCdssResult = mapSymphonyResultToCdssResult(symphonyResult);

        return { ...input, cdssResult };
      },
      compensate: async (input: DiagnosisInput, error: Error) => {
        await this.emitDlq('CDSS_QUERY', input.requestId, error);
      },
    });

    // Step 3: AI_PROCESSING — run through LangFlow / LLM pipeline
    this.addStep({
      name: 'AI_PROCESSING',
      invoke: async (input: DiagnosisCdssState): Promise<DiagnosisAiState> => {
        await this.kafka.emit('diagnosis-events', {
          event: 'AI_PROCESSING',
          requestId: input.requestId,
          timestamp: new Date().toISOString(),
        });

        const aiResult = await withRetry(async () => {
          // TODO: replace with real @the-abyss/langflow-client call when Phase B is active
          const aiProcessingId = `ai-${input.requestId}-${Date.now()}`;
          return {
            aiProcessingId,
            enhancedDiagnosis: input.cdssResult.primaryDiagnosis,
            confidence: input.cdssResult.confidence,
            aiRecommendations: input.cdssResult.recommendations,
          };
        });

        return { ...input, aiResult };
      },
      compensate: async (input: DiagnosisInput, error: Error) => {
        await this.emitDlq('AI_PROCESSING', input.requestId, error);
      },
    });

    // Step 4: RESPONSE_EMIT — emit final result to Kafka.
    // Preserves legacy flattened fields and passes SymphonyResult through unchanged.
    this.addStep({
      name: 'RESPONSE_EMIT',
      invoke: async (input: DiagnosisAiState): Promise<DiagnosisOutput> => {
        const symphonyResult: SymphonyResult = input.cdssResult.symphony;
        const output: DiagnosisOutput = {
          requestId: input.requestId,
          diagnosis: input.aiResult.enhancedDiagnosis,
          confidence: input.aiResult.confidence,
          cdssRecommendations: input.aiResult.aiRecommendations,
          aiProcessingId: input.aiResult.aiProcessingId,
          completedAt: new Date().toISOString(),
          symphony: symphonyResult,
        };

        await this.kafka.emit('diagnosis-events', {
          event: 'RESPONSE_EMIT',
          requestId: input.requestId,
          result: output,
          timestamp: output.completedAt,
        });

        return output;
      },
      compensate: async (input: DiagnosisInput, error: Error) => {
        await this.emitDlq('RESPONSE_EMIT', input.requestId, error);
      },
    });
  }

  /**
   * PHI-safe DLQ emitter. Publishes ONLY:
   *   - step (orchestration stage name)
   *   - requestId (synthetic correlation ID, no PHI)
   *   - errorType / errorName (constructor name + Error.name; no payload-derived text)
   *   - timestamp
   * Does NOT publish: raw input, patientId, symptoms, vitalSigns, organizationId,
   * SymphonyResult, error.message, or any free-text clinical payload.
   */
  private async emitDlq(
    step: string,
    requestId: string,
    error: Error,
  ): Promise<void> {
    await this.kafka.emit('diagnosis-dlq', {
      step,
      requestId,
      errorType: error.constructor.name,
      errorName: error.name,
      timestamp: new Date().toISOString(),
    }).catch((dlqErr) => {
      console.error('[DiagnosisFlowSaga] DLQ emit failed:', (dlqErr as Error).name);
    });
  }
}
