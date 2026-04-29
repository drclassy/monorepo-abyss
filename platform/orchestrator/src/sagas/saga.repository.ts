import { Injectable } from '@nestjs/common'
import { prisma, type SagaExecution } from '@the-abyss/database'

export type SagaJson =
  | string
  | number
  | boolean
  | null
  | SagaJson[]
  | { [key: string]: SagaJson }

type SagaPersistedJson = Exclude<SagaJson, null>

function isSagaJson(value: unknown): value is SagaJson {
  if (value === null) {
    return true
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(isSagaJson)
  }

  if (isRecord(value)) {
    return Object.values(value).every(isSagaJson)
  }

  return false
}

function toPersistedJson(value: unknown, label: string): SagaPersistedJson {
  if (value === null || !isSagaJson(value)) {
    throw new Error(`${label} is not JSON-serializable`)
  }

  return value
}

function isStepStatus(value: unknown): value is StepLog['status'] {
  return (
    value === 'pending' ||
    value === 'running' ||
    value === 'completed' ||
    value === 'failed' ||
    value === 'compensated'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseStepLogs(value: unknown): StepLog[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.name !== 'string' || !isStepStatus(entry.status)) {
      return []
    }

    const stepLog: StepLog = {
      name: entry.name,
      status: entry.status,
    }

    if (typeof entry.startedAt === 'string') {
      stepLog.startedAt = entry.startedAt
    }

    if (typeof entry.completedAt === 'string') {
      stepLog.completedAt = entry.completedAt
    }

    if ('output' in entry) {
      if (isSagaJson(entry.output)) {
        stepLog.output = entry.output
      }
    }

    if (typeof entry.error === 'string') {
      stepLog.error = entry.error
    }

    return [stepLog]
  })
}

function serializeStepLogs(steps: StepLog[]): SagaJson[] {
  return steps.map((step) => {
    const serialized: { [key: string]: SagaJson } = {
      name: step.name,
      status: step.status,
    }

    if (step.startedAt !== undefined) {
      serialized.startedAt = step.startedAt
    }

    if (step.completedAt !== undefined) {
      serialized.completedAt = step.completedAt
    }

    if (step.output !== undefined) {
      if (!isSagaJson(step.output)) {
        throw new Error(`Step output for "${step.name}" is not JSON-serializable`)
      }

      serialized.output = step.output
    }

    if (step.error !== undefined) {
      serialized.error = step.error
    }

    return serialized
  })
}

export interface StepLog {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensated'
  startedAt?: string
  completedAt?: string
  output?: SagaJson
  error?: string
}

@Injectable()
export class SagaRepository {
  async createExecution(
    flowId: string,
    sagaType: string,
    input: unknown,
    organizationId?: string
  ): Promise<SagaExecution> {
    const serializedInput = toPersistedJson(input, 'Saga execution input')

    return prisma.sagaExecution.create({
      data: {
        flowId,
        sagaType,
        status: 'RUNNING',
        input: serializedInput,
        steps: [],
        organizationId,
      },
    })
  }

  async updateStep(executionId: string, stepIndex: number, stepLog: StepLog): Promise<void> {
    const execution = await prisma.sagaExecution.findUnique({
      where: { id: executionId },
    })

    if (!execution) throw new Error(`Execution ${executionId} not found`)

    const steps = parseStepLogs(execution.steps)
    steps[stepIndex] = stepLog

    await prisma.sagaExecution.update({
      where: { id: executionId },
      data: { steps: serializeStepLogs(steps) },
    })
  }

  async completeExecution(executionId: string, output: unknown): Promise<void> {
    const serializedOutput = toPersistedJson(output, 'Saga execution output')

    await prisma.sagaExecution.update({
      where: { id: executionId },
      data: {
        status: 'COMPLETED',
        output: serializedOutput,
        completedAt: new Date(),
      },
    })
  }

  async failExecution(executionId: string, error: string): Promise<void> {
    await prisma.sagaExecution.update({
      where: { id: executionId },
      data: {
        status: 'FAILED',
        error,
        completedAt: new Date(),
      },
    })
  }

  async compensateExecution(executionId: string): Promise<void> {
    await prisma.sagaExecution.update({
      where: { id: executionId },
      data: {
        status: 'COMPENSATED',
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
