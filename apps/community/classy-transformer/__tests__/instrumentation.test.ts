import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('register()', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns immediately outside Node.js runtime', async () => {
    delete process.env.NEXT_RUNTIME
    vi.doMock('@respan/respan', () => ({ Respan: vi.fn() }))
    vi.doMock('@respan/instrumentation-anthropic', () => ({ AnthropicInstrumentor: vi.fn() }))
    vi.doMock('@respan/instrumentation-openai', () => ({ OpenAIInstrumentor: vi.fn() }))

    const { register } = await import('../instrumentation')
    await expect(register()).resolves.toBeUndefined()

    const { Respan } = await import('@respan/respan')
    expect(Respan).not.toHaveBeenCalled()
  })

  it('warns and skips init when RESPAN_API_KEY is missing', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    delete process.env.RESPAN_API_KEY

    const MockRespan = vi.fn()
    vi.doMock('@respan/respan', () => ({ Respan: MockRespan }))
    vi.doMock('@respan/instrumentation-anthropic', () => ({ AnthropicInstrumentor: vi.fn() }))
    vi.doMock('@respan/instrumentation-openai', () => ({ OpenAIInstrumentor: vi.fn() }))

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { register } = await import('../instrumentation')
    await register()

    expect(warnSpy).toHaveBeenCalledWith('[respan] RESPAN_API_KEY not set — tracing disabled')
    expect(MockRespan).not.toHaveBeenCalled()
    warnSpy.mockRestore()
    delete process.env.NEXT_RUNTIME
  })

  it('initializes Respan with both instrumentors when API key is present', async () => {
    process.env.NEXT_RUNTIME = 'nodejs'
    process.env.RESPAN_API_KEY = 'rsp_test_key_123'

    const mockInit = vi.fn().mockResolvedValue(undefined)
    const MockRespan = vi.fn().mockImplementation(() => ({ initialize: mockInit }))
    const MockAnthropicInstrumentor = vi.fn()
    const MockOpenAIInstrumentor = vi.fn()

    vi.doMock('@respan/respan', () => ({ Respan: MockRespan }))
    vi.doMock('@respan/instrumentation-anthropic', () => ({ AnthropicInstrumentor: MockAnthropicInstrumentor }))
    vi.doMock('@respan/instrumentation-openai', () => ({ OpenAIInstrumentor: MockOpenAIInstrumentor }))

    const { register } = await import('../instrumentation')
    await register()

    expect(MockRespan).toHaveBeenCalledOnce()
    expect(MockRespan).toHaveBeenCalledWith({
      apiKey: 'rsp_test_key_123',
      instrumentations: [expect.any(Object), expect.any(Object)],
    })
    expect(mockInit).toHaveBeenCalledOnce()

    delete process.env.NEXT_RUNTIME
    delete process.env.RESPAN_API_KEY
  })
})
