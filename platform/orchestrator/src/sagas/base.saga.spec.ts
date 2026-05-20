import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BaseSaga } from './base.saga'
import type { SagaRepository } from './saga.repository'

describe('BaseSaga', () => {
  let repository: SagaRepository

  beforeEach(() => {
    repository = {
      updateStep: vi.fn().mockResolvedValue(undefined),
      compensateExecution: vi.fn().mockResolvedValue(undefined),
      createExecution: vi.fn(),
      findById: vi.fn(),
    } as unknown as SagaRepository
  })

  it('runs steps in order and returns final output', async () => {
    class TestSaga extends BaseSaga<number, number> {
      constructor() {
        super()
        this.addStep({
          name: 'inc',
          invoke: async (n: number) => n + 1,
        }).addStep({
          name: 'double',
          invoke: async (n: number) => n * 2,
        })
      }
    }

    const saga = new TestSaga()
    const result = await saga.execute(2)
    expect(result).toBe(6)
  })

  it('invokes repository when execution context is set', async () => {
    class OneStepSaga extends BaseSaga<void, number> {
      constructor() {
        super()
        this.addStep({
          name: 'only',
          invoke: async () => 42,
        })
      }
    }

    const saga = new OneStepSaga()
    saga.setExecutionContext('exec-1', repository)
    await saga.execute(undefined)

    expect(repository.updateStep).toHaveBeenCalled()
  })

  it('runs compensation when a step fails after prior steps succeeded', async () => {
    const compensate = vi.fn().mockResolvedValue(undefined)

    class FailingSaga extends BaseSaga<void, void> {
      constructor() {
        super()
        this.addStep({
          name: 'ok',
          invoke: async () => undefined,
          compensate,
        }).addStep({
          name: 'bad',
          invoke: async () => {
            throw new Error('boom')
          },
        })
      }
    }

    const saga = new FailingSaga()
    saga.setExecutionContext('exec-2', repository)

    await expect(saga.execute(undefined)).rejects.toThrow('boom')
    expect(compensate).toHaveBeenCalled()
    expect(repository.compensateExecution).toHaveBeenCalledWith('exec-2')
  })
})
