/**
 * Shared LLM observability for the Abyss monorepo.
 *
 * Owns the Respan SDK dependency and exposes a single, reusable initializer.
 * Apps call {@link registerObservability} from their startup hook (Next.js
 * `instrumentation.ts` `register()`, or a Node service entrypoint) instead of
 * re-implementing the boilerplate per app.
 *
 * Tracing runs server-side only.
 *
 * Why the caller passes the SDK modules: in bundled environments (Next.js),
 * Respan's automatic, require-hook-based instrumentation does not bind — it
 * cannot resolve the SDK across the bundler/pnpm boundary. The SDK's own
 * `instrumentModules` option is the documented workaround: the app imports its
 * own `openai` / `@anthropic-ai/sdk` (where they actually resolve) and hands
 * the module objects in here for Respan to patch directly.
 */

/** SDK module objects to instrument. Keys mirror Respan's `instrumentModules`. */
export interface ObservabilityModules {
  /** The `openai` default export (the `OpenAI` class). */
  openAI?: unknown
  /** The `@anthropic-ai/sdk` default export (the `Anthropic` class). */
  anthropic?: unknown
}

let initialized = false

/**
 * Initialize Respan tracing once per process. Idempotent and safe to call from
 * multiple entrypoints. Returns `true` when tracing is active, `false` when it
 * is disabled because `RESPAN_API_KEY` is not set.
 *
 * @param instrumentModules SDK module objects to instrument. Omit for
 * non-bundled (plain Node) processes where auto-discovery works.
 */
export async function registerObservability(
  instrumentModules?: ObservabilityModules
): Promise<boolean> {
  if (initialized) return true

  if (!process.env.RESPAN_API_KEY) {
    console.warn('[observability] RESPAN_API_KEY not set — tracing disabled')
    return false
  }

  // Use RespanTelemetry (the low-level @respan/tracing engine), not the
  // @respan/respan `Respan` wrapper: only RespanTelemetry accepts
  // `instrumentModules`, and the wrapper additionally disables openAI/anthropic
  // by default. `instrumentModules` is Respan's documented Next.js/bundler
  // workaround — patching the passed module objects instead of relying on
  // require-hooks that break under a bundler.
  const { RespanTelemetry } = await import('@respan/tracing')

  const telemetry = new RespanTelemetry({
    apiKey: process.env.RESPAN_API_KEY,
    appName: 'the-abyss',
    ...(instrumentModules ? { instrumentModules } : {}),
  })
  await telemetry.initialize()

  initialized = true
  return true
}
