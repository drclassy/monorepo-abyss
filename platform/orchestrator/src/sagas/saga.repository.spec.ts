import { prisma } from '@the-abyss/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SagaJson } from './saga.repository'
import { SagaRepository } from './saga.repository'

// Mock the database
vi.mock('@the-abyss/database', () => ({
  prisma: {
    sagaExecution: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('SagaRepository', () => {
  let repository: SagaRepository

  function toJson(value: SagaJson) {
    return value
  }

  beforeEach(() => {
    repository = new SagaRepository()
    vi.clearAllMocks()
  })

  describe('createExecution', () => {
    it('should create saga execution with RUNNING status', async () => {
      const mockExecution = {
        id: 'exec-1',
        flowId: 'test-flow',
        sagaType: 'test-saga',
        status: 'RUNNING',
        input: { test: 'data' },
        steps: [],
        organizationId: 'org-1',
      }

      vi.mocked(prisma.sagaExecution.create).mockResolvedValue(mockExecution as never)

      const result = await repository.createExecution(
        'test-flow',
        'test-saga',
        { test: 'data' },
        'org-1'
      )

      expect(prisma.sagaExecution.create).toHaveBeenCalledWith({
        data: {
          flowId: 'test-flow',
          sagaType: 'test-saga',
          status: 'RUNNING',
          input: { test: 'data' },
          steps: [],
          organizationId: 'org-1',
        },
      })
      expect(result).toEqual(mockExecution)
    })

    it('should create execution without organizationId', async () => {
      const mockExecution = {
        id: 'exec-2',
        flowId: 'test-flow',
        sagaType: 'test-saga',
        status: 'RUNNING',
        input: {},
        steps: [],
        organizationId: null,
      }

      vi.mocked(prisma.sagaExecution.create).mockResolvedValue(mockExecution as never)

      await repository.createExecution('test-flow', 'test-saga', {})

      expect(prisma.sagaExecution.create).toHaveBeenCalledWith({
        data: {
          flowId: 'test-flow',
          sagaType: 'test-saga',
          status: 'RUNNING',
          input: {},
          steps: [],
          organizationId: undefined,
        },
      })
    })
  })

  describe('updateStep', () => {
    it('should update step log at specific index', async () => {
      const mockExecution = {
        id: 'exec-1',
        steps: [],
      }

      vi.mocked(prisma.sagaExecution.findUnique).mockResolvedValue(mockExecution as never)
      vi.mocked(prisma.sagaExecution.update).mockResolvedValue({} as never)

      await repository.updateStep('exec-1', 0, {
        name: 'test-step',
        status: 'running',
        startedAt: new Date().toISOString(),
      })

      expect(prisma.sagaExecution.findUnique).toHaveBeenCalledWith({
        where: { id: 'exec-1' },
      })
      expect(prisma.sagaExecution.update).toHaveBeenCalled()
    })

    it('should throw error if execution not found', async () => {
      vi.mocked(prisma.sagaExecution.findUnique).mockResolvedValue(null)

      await expect(
        repository.updateStep('non-existent', 0, {
          name: 'test-step',
          status: 'running',
        })
      ).rejects.toThrow('Execution non-existent not found')
    })
  })

  describe('completeExecution', () => {
    it('should mark execution as COMPLETED with output', async () => {
      vi.mocked(prisma.sagaExecution.update).mockResolvedValue({} as never)

      await repository.completeExecution('exec-1', toJson({ result: 'success' }))

      expect(prisma.sagaExecution.update).toHaveBeenCalledWith({
        where: { id: 'exec-1' },
        data: {
          status: 'COMPLETED',
          output: { result: 'success' },
          completedAt: expect.any(Date),
        },
      })
    })
  })

  describe('failExecution', () => {
    it('should mark execution as FAILED with error message', async () => {
      vi.mocked(prisma.sagaExecution.update).mockResolvedValue({} as never)

      await repository.failExecution('exec-1', 'Something went wrong')

      expect(prisma.sagaExecution.update).toHaveBeenCalledWith({
        where: { id: 'exec-1' },
        data: {
          status: 'FAILED',
          error: 'Something went wrong',
          completedAt: expect.any(Date),
        },
      })
    })
  })

  describe('compensateExecution', () => {
    it('should mark execution as COMPENSATED', async () => {
      vi.mocked(prisma.sagaExecution.update).mockResolvedValue({} as never)

      await repository.compensateExecution('exec-1')

      expect(prisma.sagaExecution.update).toHaveBeenCalledWith({
        where: { id: 'exec-1' },
        data: {
          status: 'COMPENSATED',
          completedAt: expect.any(Date),
        },
      })
    })
  })

  describe('getExecution', () => {
    it('should retrieve execution by ID', async () => {
      const mockExecution = {
        id: 'exec-1',
        flowId: 'test-flow',
        status: 'COMPLETED',
      }

      vi.mocked(prisma.sagaExecution.findUnique).mockResolvedValue(mockExecution as never)

      const result = await repository.getExecution('exec-1')

      expect(prisma.sagaExecution.findUnique).toHaveBeenCalledWith({
        where: { id: 'exec-1' },
      })
      expect(result).toEqual(mockExecution)
    })

    it('should return null for non-existent ID', async () => {
      vi.mocked(prisma.sagaExecution.findUnique).mockResolvedValue(null)

      const result = await repository.getExecution('non-existent')

      expect(result).toBeNull()
    })
  })
})
