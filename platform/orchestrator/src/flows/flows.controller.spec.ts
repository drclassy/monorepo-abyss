import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FlowsController } from './flows.controller'
import { FlowsService } from './flows.service'

describe('FlowsController', () => {
  let controller: FlowsController
  let flowsService: FlowsService

  beforeEach(() => {
    flowsService = {
      runFlow: vi.fn().mockResolvedValue({
        executionId: 'exec-123',
        result: 'success',
      }),
      getExecutionStatus: vi.fn().mockResolvedValue({
        id: 'exec-123',
        status: 'COMPLETED',
      }),
    } as unknown as FlowsService

    controller = new FlowsController(flowsService)
  })

  describe('runFlow', () => {
    it('should POST /flows/:flowId/run and return result', async () => {
      const flowId = 'diagnosis-flow'
      const executionDto = {
        input: { patientId: 'p-1', symptoms: ['fever'] },
        organizationId: 'org-1',
        shadowMode: false,
      }

      const result = await controller.runFlow(flowId, executionDto)

      expect(flowsService.runFlow).toHaveBeenCalledWith(flowId, executionDto)
      expect(result).toEqual({
        executionId: 'exec-123',
        result: 'success',
      })
    })

    it('should handle shadow mode', async () => {
      const flowId = 'diagnosis-flow'
      const executionDto = {
        input: { patientId: 'p-1' },
        organizationId: 'org-1',
        shadowMode: true,
      }

      await controller.runFlow(flowId, executionDto)

      expect(flowsService.runFlow).toHaveBeenCalledWith(flowId, executionDto)
    })
  })

  describe('getExecutionStatus', () => {
    it('should GET /flows/:executionId/status and return execution', async () => {
      const executionId = 'exec-123'

      const result = await controller.getExecutionStatus(executionId)

      expect(flowsService.getExecutionStatus).toHaveBeenCalledWith(executionId)
      expect(result).toEqual({
        id: 'exec-123',
        status: 'COMPLETED',
      })
    })
  })
})
