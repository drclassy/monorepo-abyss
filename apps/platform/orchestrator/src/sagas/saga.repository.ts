import { Injectable } from '@nestjs/common'
import { prisma, SagaExecution, SagaExecutionStatus } from '@the-abyss/database'

export interface StepLog {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensated'
  startedAt?: string
  completedAt?: string
  output?: any
  error?: string
}

@Injectable()
export class SagaRepository {
  async createExecution(
    flowId: string,
    sagaType: string,
    input: any,
    organizationId?: string
  ): Promise<SagaExecution> {
    return prisma.sagaExecution.create({
      data: {
        flowId,
        sagaType,
        status: 'RUNNING' as SagaExecutionStatus,
        input,
        steps: [] as any,
        organizationId,
      },
    })
  }

  async updateStep(executionId: string, stepIndex: number, stepLog: StepLog): Promise<void> {
    const execution = await prisma.sagaExecution.findUnique({
      where: { id: executionId },
    })

    if (!execution) throw new Error(`Execution ${executionId} not found`)

    const steps = (execution.steps as unknown as StepLog[]) || []
    steps[stepIndex] = stepLog

    await prisma.sagaExecution.update({
      where: { id: executionId },
      data: { steps: steps as any },
    })
  }

  async completeExecution(executionId: string, output: any): Promise<void> {
    await prisma.sagaExecution.update({
      where: { id: executionId },
      data: {
        status: 'COMPLETED' as SagaExecutionStatus,
        output,
        completedAt: new Date(),
      },
    })
  }

  async failExecution(executionId: string, error: string): Promise<void> {
    await prisma.sagaExecution.update({
      where: { id: executionId },
      data: {
        status: 'FAILED' as SagaExecutionStatus,
        error,
        completedAt: new Date(),
      },
    })
  }

  async compensateExecution(executionId: string): Promise<void> {
    await prisma.sagaExecution.update({
      where: { id: executionId },
      data: {
        status: 'COMPENSATED' as SagaExecutionStatus,
        completedAt: new Date(),
      },
    })
  }

  async getExecution(executionId: string): Promise<SagaExecution | null> {
    return prisma.sagaExecution.findUnique({
      where: { id: executionId },
    })
  }
}
