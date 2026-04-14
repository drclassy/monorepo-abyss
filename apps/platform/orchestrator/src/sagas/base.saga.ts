import { Injectable } from '@nestjs/common'
import { SagaRepository, StepLog } from './saga.repository'

export interface SagaStep<TInput = any, TOutput = any> {
  name: string
  invoke: (input: TInput) => Promise<TOutput>
  compensate?: (input: TInput, error: Error) => Promise<void>
}

@Injectable()
export abstract class BaseSaga<TInitialInput = any, TFinalOutput = any> {
  protected steps: SagaStep[] = []
  protected executionId?: string
  protected repository?: SagaRepository

  setExecutionContext(executionId: string, repository: SagaRepository): void {
    this.executionId = executionId
    this.repository = repository
  }

  addStep<TIn, TOut>(step: SagaStep<TIn, TOut>): this {
    this.steps.push(step)
    return this
  }

  async execute(initialInput: TInitialInput): Promise<TFinalOutput> {
    const executedSteps: SagaStep[] = []
    let currentInput = initialInput

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i]

      // Log step start
      await this.logStepStart(i, step.name)

      try {
        console.log(`[Saga] Invoking step: ${step.name}`)
        const result = await step.invoke(currentInput)

        // Log step completion
        await this.logStepComplete(i, step.name, result)

        executedSteps.push(step)
        currentInput = result
      } catch (error) {
        console.error(`[Saga] Step failed. Starting compensation...`, error)
        await this.logStepFailed(i, step.name, error as Error)
        await this.runCompensation(executedSteps, initialInput, error as Error)
        throw error
      }
    }

    return currentInput as unknown as TFinalOutput
  }

  private async logStepStart(index: number, name: string): Promise<void> {
    if (!this.executionId || !this.repository) return

    await this.repository.updateStep(this.executionId, index, {
      name,
      status: 'running',
      startedAt: new Date().toISOString(),
    })
  }

  private async logStepComplete(index: number, name: string, output: any): Promise<void> {
    if (!this.executionId || !this.repository) return

    await this.repository.updateStep(this.executionId, index, {
      name,
      status: 'completed',
      completedAt: new Date().toISOString(),
      output,
    })
  }

  private async logStepFailed(index: number, name: string, error: Error): Promise<void> {
    if (!this.executionId || !this.repository) return

    await this.repository.updateStep(this.executionId, index, {
      name,
      status: 'failed',
      completedAt: new Date().toISOString(),
      error: error.message,
    })
  }

  private async runCompensation(
    executedSteps: SagaStep[],
    initialInput: any,
    error: any
  ): Promise<void> {
    for (const step of executedSteps.reverse()) {
      if (step.compensate) {
        try {
          console.log(`[Saga] Compensating step: ${step.name}`)
          await step.compensate(initialInput, error)
        } catch (compError) {
          console.error(`[Saga] Compensation failed for step: ${step.name}`, compError)
        }
      }
    }

    // Mark execution as compensated
    if (this.executionId && this.repository) {
      await this.repository.compensateExecution(this.executionId)
    }
  }
}
