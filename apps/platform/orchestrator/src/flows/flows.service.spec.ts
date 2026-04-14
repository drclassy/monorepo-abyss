import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { FlowsService } from './flows.service'
import { KafkaService } from '../kafka/kafka.service'
import { SagaRepository } from '../sagas/saga.repository'
import { DiagnosisFlowSaga } from '../sagas/diagnosis-flow.saga'
import { ReferralFlowSaga } from '../sagas/referral-flow.saga'

describe('FlowsService', () => {
  let service: FlowsService
  let kafkaService: KafkaService
  let sagaRepository: SagaRepository
  let diagnosisSaga: DiagnosisFlowSaga
  let referralSaga: ReferralFlowSaga

  beforeEach(() => {
    kafkaService = {
      emit: vi.fn().mockResolvedValue(undefined),
    } as unknown as KafkaService

    sagaRepository = {
      createExecution: vi.fn().mockResolvedValue({ id: 'exec-123' }),
      completeExecution: vi.fn().mockResolvedValue(undefined),
      failExecution: vi.fn().mockResolvedValue(undefined),
      getExecution: vi.fn(),
    } as unknown as SagaRepository

    diagnosisSaga = {
      setExecutionContext: vi.fn(),
      execute: vi.fn().mockResolvedValue({
        requestId: 'req-123',
        diagnosis: ['flu'],
        confidence: 0.95,
      }),
    } as unknown as DiagnosisFlowSaga

    referralSaga = {
      setExecutionContext: vi.fn(),
      execute: vi.fn().mockResolvedValue({
        referralId: 'ref-123',
        status: 'confirmed',
      }),
    } as unknown as ReferralFlowSaga

    service = new FlowsService(kafkaService, sagaRepository, diagnosisSaga, referralSaga)
  })

  describe('runFlow', () => {
    it('should execute diagnosis-flow successfully', async () => {
      const data = {
        input: { patientId: 'p-1', symptoms: ['fever'] },
        organizationId: 'org-1',
        shadowMode: false,
      }

      const result = await service.runFlow('diagnosis-flow', data)

      expect(sagaRepository.createExecution).toHaveBeenCalledWith(
        'diagnosis-flow',
        'diagnosis-flow',
        data.input,
        'org-1'
      )
      expect(diagnosisSaga.setExecutionContext).toHaveBeenCalledWith('exec-123', sagaRepository)
      expect(diagnosisSaga.execute).toHaveBeenCalled()
      expect(sagaRepository.completeExecution).toHaveBeenCalledWith('exec-123', expect.any(Object))
      expect(result).toEqual({
        executionId: 'exec-123',
        requestId: 'req-123',
        diagnosis: ['flu'],
        confidence: 0.95,
      })
    })

    it('should execute referral-flow successfully', async () => {
      const data = {
        input: { patientId: 'p-1', destinationOrganizationId: 'org-2' },
        organizationId: 'org-1',
        shadowMode: false,
      }

      const result = await service.runFlow('referral-flow', data)

      expect(sagaRepository.createExecution).toHaveBeenCalledWith(
        'referral-flow',
        'referral-flow',
        data.input,
        'org-1'
      )
      expect(referralSaga.setExecutionContext).toHaveBeenCalledWith('exec-123', sagaRepository)
      expect(referralSaga.execute).toHaveBeenCalled()
      expect(result).toEqual({
        executionId: 'exec-123',
        referralId: 'ref-123',
        status: 'confirmed',
      })
    })

    it('should throw NotFoundException for unknown flow', async () => {
      const data = {
        input: {},
        organizationId: 'org-1',
        shadowMode: false,
      }

      await expect(service.runFlow('unknown-flow', data)).rejects.toThrow(NotFoundException)
      expect(sagaRepository.failExecution).toHaveBeenCalledWith(
        'exec-123',
        "Flow 'unknown-flow' is not registered"
      )
    })

    it('should mark execution as FAILED when saga fails', async () => {
      vi.mocked(diagnosisSaga.execute).mockRejectedValue(new Error('Saga failed'))

      const data = {
        input: { patientId: 'p-1' },
        organizationId: 'org-1',
        shadowMode: false,
      }

      await expect(service.runFlow('diagnosis-flow', data)).rejects.toThrow('Saga failed')
      expect(sagaRepository.failExecution).toHaveBeenCalledWith('exec-123', 'Saga failed')
    })

    it('should emit shadow-exec event in shadow mode', async () => {
      const data = {
        input: { patientId: 'p-1' },
        organizationId: 'org-1',
        shadowMode: true,
      }

      await service.runFlow('diagnosis-flow', data)

      expect(kafkaService.emit).toHaveBeenCalledWith(
        'shadow-exec',
        expect.objectContaining({
          flowId: 'diagnosis-flow',
          executionId: 'exec-123',
          input: data.input,
          primaryResult: expect.any(Object),
          timestamp: expect.any(String),
        })
      )
    })

    it('should not emit shadow-exec when shadowMode is false', async () => {
      const data = {
        input: { patientId: 'p-1' },
        organizationId: 'org-1',
        shadowMode: false,
      }

      await service.runFlow('diagnosis-flow', data)

      expect(kafkaService.emit).not.toHaveBeenCalled()
    })
  })

  describe('getExecutionStatus', () => {
    it('should return execution by ID', async () => {
      const mockExecution = {
        id: 'exec-123',
        flowId: 'test-flow',
        status: 'COMPLETED',
      }

      vi.mocked(sagaRepository.getExecution).mockResolvedValue(mockExecution as any)

      const result = await service.getExecutionStatus('exec-123')

      expect(sagaRepository.getExecution).toHaveBeenCalledWith('exec-123')
      expect(result).toEqual(mockExecution)
    })

    it('should throw NotFoundException for non-existent execution', async () => {
      vi.mocked(sagaRepository.getExecution).mockResolvedValue(null)

      await expect(service.getExecutionStatus('non-existent')).rejects.toThrow(NotFoundException)
    })
  })
})
