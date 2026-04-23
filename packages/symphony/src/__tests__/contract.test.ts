import { describe, expect, it } from 'vitest'

import {
  SYMPHONY_ENGINE_PACKAGE_NAME,
  assessSymphonyInput,
  type SymphonyAssessmentInput,
} from '../index'

describe('@the-abyss/symphony scaffold', () => {
  it('exports the engine package identity', () => {
    expect(SYMPHONY_ENGINE_PACKAGE_NAME).toBe('@the-abyss/symphony')
  })

  it('returns a degraded partial-migration result without claiming canonical readiness', () => {
    const input: SymphonyAssessmentInput = {
      metadata: {
        requestId: 'request-smoke',
        requestedAt: '2026-04-18T00:00:00.000Z',
        caller: 'dashboard',
      },
      patientContext: {
        encounterId: 'encounter-smoke',
        patientRef: 'patient-smoke',
      },
      vitals: [],
    }

    const result = assessSymphonyInput(input)

    expect(result.metadata.status).toBe('degraded')
    expect(result.metadata.degradedReason).toBe('symphony_engine_partial_migration')
    expect(result.patientContext).toEqual(input.patientContext)
    expect(result.alerts).toHaveLength(0)
    expect(result.diagnosisSuggestions).toHaveLength(0)
    expect(result.trafficLight).toBeUndefined()
  })
})
