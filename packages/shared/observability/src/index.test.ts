import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hoisted spies so the vi.mock factories below can reference them safely.
const { initialize, respanCtor } = vi.hoisted(() => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  respanCtor: vi.fn(),
}))

vi.mock('@respan/respan', () => ({
  Respan: class {
    initialize = initialize
    constructor(...args: unknown[]) {
      respanCtor(...args)
    }
  },
}))
vi.mock('@respan/instrumentation-anthropic', () => ({
  AnthropicInstrumentor: vi.fn(),
}))
vi.mock('@respan/instrumentation-openai', () => ({
  OpenAIInstrumentor: vi.fn(),
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
    expect(respanCtor).not.toHaveBeenCalled()
    expect(initialize).not.toHaveBeenCalled()
  })

  it('initializes Respan and returns true when RESPAN_API_KEY is set', async () => {
    process.env.RESPAN_API_KEY = 'test-key'
    const { registerObservability } = await import('./index')

    const result = await registerObservability()

    expect(result).toBe(true)
    expect(respanCtor).toHaveBeenCalledTimes(1)
    expect(respanCtor).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'test-key' }))
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
