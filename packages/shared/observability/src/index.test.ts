import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hoisted spies so the vi.mock factory below can reference them safely.
const { initialize, telemetryCtor } = vi.hoisted(() => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  telemetryCtor: vi.fn(),
}))

vi.mock('@respan/tracing', () => ({
  RespanTelemetry: class {
    initialize = initialize
    constructor(...args: unknown[]) {
      telemetryCtor(...args)
    }
  },
}))

describe('registerObservability', () => {
  const ORIGINAL_KEY = process.env.RESPAN_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the module-level `initialized` flag between tests.
    vi.resetModules()
    delete process.env.RESPAN_API_KEY
  })

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.RESPAN_API_KEY
    else process.env.RESPAN_API_KEY = ORIGINAL_KEY
  })

  it('returns false and does not initialize when RESPAN_API_KEY is absent', async () => {
    const { registerObservability } = await import('./index')

    const result = await registerObservability()

    expect(result).toBe(false)
    expect(telemetryCtor).not.toHaveBeenCalled()
    expect(initialize).not.toHaveBeenCalled()
  })

  it('passes caller-provided instrumentModules through to RespanTelemetry', async () => {
    process.env.RESPAN_API_KEY = 'test-key'
    const openAI = { tag: 'openai-module' }
    const anthropic = { tag: 'anthropic-module' }
    const { registerObservability } = await import('./index')

    const result = await registerObservability({ openAI, anthropic })

    expect(result).toBe(true)
    expect(telemetryCtor).toHaveBeenCalledTimes(1)
    expect(telemetryCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-key',
        instrumentModules: { openAI, anthropic },
      })
    )
    expect(initialize).toHaveBeenCalledTimes(1)
  })

  it('is idempotent — initializes only once across repeated calls', async () => {
    process.env.RESPAN_API_KEY = 'test-key'
    const { registerObservability } = await import('./index')

    await registerObservability()
    const second = await registerObservability()

    expect(second).toBe(true)
    expect(initialize).toHaveBeenCalledTimes(1)
  })
})
