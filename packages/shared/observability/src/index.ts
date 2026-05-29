/**
 * Shared LLM observability for the Abyss monorepo.
 *
 * Owns the Respan SDK + instrumentor dependencies and exposes a single, reusable
 * initializer. Apps call {@link registerObservability} from their startup hook
 * (Next.js `instrumentation.ts` `register()`, or a Node service entrypoint)
 * instead of re-implementing the boilerplate per app.
 *
 * Tracing runs server-side only — OpenAI and Anthropic SDK calls are
 * auto-captured once their instrumentors are active.
 */

let initialized = false

/**
 * Initialize Respan tracing once per process. Idempotent and safe to call from
 * multiple entrypoints. Returns `true` when tracing is active, `false` when it
 * is disabled because `RESPAN_API_KEY` is not set.
 */
export async function registerObservability(): Promise<boolean> {
  if (initialized) return true

  if (!process.env.RESPAN_API_KEY) {
    console.warn('[observability] RESPAN_API_KEY not set — tracing disabled')
    return false
  }

  const { Respan } = await import('@respan/respan')
  const { AnthropicInstrumentor } = await import('@respan/instrumentation-anthropic')
  const { OpenAIInstrumentor } = await import('@respan/instrumentation-openai')

  const respan = new Respan({
    apiKey: process.env.RESPAN_API_KEY,
    instrumentations: [new AnthropicInstrumentor(), new OpenAIInstrumentor()],
  })
  await respan.initialize()

  initialized = true
  return true
}
