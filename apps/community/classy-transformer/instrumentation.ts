export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { Respan } = await import('@respan/respan')
  const { AnthropicInstrumentor } = await import('@respan/instrumentation-anthropic')
  const { OpenAIInstrumentor } = await import('@respan/instrumentation-openai')

  if (!process.env.RESPAN_API_KEY) {
    console.warn('[respan] RESPAN_API_KEY not set — tracing disabled')
    return
  }

  const respan = new Respan({
    apiKey: process.env.RESPAN_API_KEY,
    instrumentations: [new AnthropicInstrumentor(), new OpenAIInstrumentor()],
  })
  await respan.initialize()
}
