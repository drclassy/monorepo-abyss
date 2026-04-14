import { Injectable, NotFoundException } from '@nestjs/common'
import { KafkaService } from '../kafka/kafka.service'
import { SagaRepository } from '../sagas/saga.repository'
import { FlowExecutionDto } from '../common/dto/flow-execution.dto'
import { DiagnosisFlowSaga } from '../sagas/diagnosis-flow.saga'
import { ReferralFlowSaga } from '../sagas/referral-flow.saga'

@Injectable()
export class FlowsService {
  constructor(
    private readonly kafka: KafkaService,
    private readonly sagaRepository: SagaRepository,
    private readonly diagnosisSaga: DiagnosisFlowSaga,
    private readonly referralSaga: ReferralFlowSaga
  ) {}

  async runFlow(flowId: string, data: FlowExecutionDto) {
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
          } as any)
          break

        case 'referral-flow':
          // Set execution context for persistence
          this.referralSaga.setExecutionContext(execution.id, this.sagaRepository)
          result = await this.referralSaga.execute({
            ...data.input,
            sourceOrganizationId: data.organizationId,
            referralId: `ref-${Date.now()}`,
          } as any)
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
      } as any
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
