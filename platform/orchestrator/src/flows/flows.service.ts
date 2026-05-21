import { Injectable, NotFoundException } from '@nestjs/common'

import { type FlowExecutionDto } from '../common/dto/flow-execution.dto'
import { type KafkaService } from '../kafka/kafka.service'
import { type DiagnosisFlowSaga, type DiagnosisInput } from '../sagas/diagnosis-flow.saga'
import { type ReferralFlowSaga, type ReferralInput } from '../sagas/referral-flow.saga'
import { type SagaRepository } from '../sagas/saga.repository'

type FlowRunResult = {
  executionId: string
} & Record<string, unknown>

@Injectable()
export class FlowsService {
  constructor(
    private readonly kafka: KafkaService,
    private readonly sagaRepository: SagaRepository,
    private readonly diagnosisSaga: DiagnosisFlowSaga,
    private readonly referralSaga: ReferralFlowSaga
  ) {}

  async runFlow(flowId: string, data: FlowExecutionDto): Promise<FlowRunResult> {
    console.log(`[Orchestrator] Running flow: ${flowId} for org: ${data.organizationId}`)

    // Create saga execution record for tracking
    const execution = await this.sagaRepository.createExecution(
      flowId,
      flowId, // sagaType is the same as flowId
      data.input,
      data.organizationId
    )

    let result: unknown

    try {
      switch (flowId) {
        case 'diagnosis-flow':
          // Set execution context for persistence
          this.diagnosisSaga.setExecutionContext(execution.id, this.sagaRepository)
          result = await this.diagnosisSaga.execute({
            ...data.input,
            organizationId: data.organizationId,
            requestId: `req-${Date.now()}`,
          } as unknown as DiagnosisInput)
          break

        case 'referral-flow':
          // Set execution context for persistence
          this.referralSaga.setExecutionContext(execution.id, this.sagaRepository)
          result = await this.referralSaga.execute({
            ...data.input,
            sourceOrganizationId: data.organizationId,
            referralId: `ref-${Date.now()}`,
          } as unknown as ReferralInput)
          break

        default:
          await this.sagaRepository.failExecution(
            execution.id,
            `Flow '${flowId}' is not registered`
          )
          throw new NotFoundException(`Flow '${flowId}' is not registered in this orchestrator`)
      }

      // Mark execution as completed
      await this.sagaRepository.completeExecution(execution.id, result)

      // Handle Shadow Mode — emit parallel execution for comparison
      if (data.shadowMode) {
        this.kafka
          .emit('shadow-exec', {
            flowId,
            executionId: execution.id,
            input: data.input,
            primaryResult: result,
            timestamp: new Date().toISOString(),
          })
          .catch((err) => {
            console.error('[Orchestrator] Shadow mode emit failed:', err)
          })
      }

      return {
        executionId: execution.id,
        ...(typeof result === 'object' && result !== null ? result : {}),
      }
    } catch (error) {
      // Mark execution as failed
      await this.sagaRepository.failExecution(execution.id, (error as Error).message)
      throw error
    }
  }

  async getExecutionStatus(executionId: string) {
    const execution = await this.sagaRepository.getExecution(executionId)
    if (!execution) {
      throw new NotFoundException(`Execution '${executionId}' not found`)
    }
    return execution
  }
}
