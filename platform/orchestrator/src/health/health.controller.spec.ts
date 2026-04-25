import { HealthCheckService } from '@nestjs/terminus'
import { Test } from '@nestjs/testing'
import 'reflect-metadata'
import { describe, expect, it, vi } from 'vitest'
import { HealthController } from './health.controller'
import { HealthModule } from './health.module'

describe('HealthController', () => {
  it('delegates to HealthCheckService.check', async () => {
    const check = vi.fn().mockResolvedValue({ status: 'ok', info: {} })
    const health = { check } as unknown as HealthCheckService
    const controller = new HealthController(health)
    await controller.check()
    expect(check).toHaveBeenCalledWith([])
  })

  it('HealthModule compiles', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile()
    expect(moduleRef.get(HealthController)).toBeDefined()
    expect(moduleRef.get(HealthCheckService)).toBeDefined()
  })
})
