# @the-abyss/observability

Shared LLM observability for the Abyss monorepo, powered by
[Respan](https://respan.ai).

This package owns the Respan SDK + instrumentor dependencies and exposes **one**
reusable initializer — `registerObservability()`. Apps call it from their
startup hook instead of re-implementing the wiring per app.

## Why a shared package

LLM tracing instrumentation is **process-global** (it monkey-patches the SDKs at
runtime). Installing it per app duplicates dependencies and config and risks
version drift. Centralizing it here gives one place to pin Respan versions and
one init contract for every consumer.

## What gets traced

Auto-captured once initialized (server-side only):

| Provider  | SDK                 | Instrumentor                        |
| --------- | ------------------- | ----------------------------------- |
| OpenAI    | `openai`            | `@respan/instrumentation-openai`    |
| Anthropic | `@anthropic-ai/sdk` | `@respan/instrumentation-anthropic` |

> Other providers (e.g. Mistral) are not yet covered — add their instrumentor
> here when needed, not in the app.

## Configuration

Set `RESPAN_API_KEY` in the environment. When it is **absent**, tracing disables
itself gracefully (a warning is logged, `registerObservability()` returns
`false`) — safe for CI and tests. `RESPAN_API_KEY` is registered in the root
`turbo.json` `globalEnv` so Turbo passes it through to tasks.

## Usage

Add the dependency:

```jsonc
// package.json
"dependencies": {
  "@the-abyss/observability": "workspace:*"
}
```

### Next.js (App Router)

Next runs `instrumentation.ts` `register()` at server startup. The app imports
its **own** LLM SDKs and passes them in — under Next's bundler, Respan's
auto-discovery cannot bind to the SDKs, so the modules must be handed over
explicitly (Respan's `instrumentModules` workaround):

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const [{ registerObservability }, openai, anthropic] = await Promise.all([
    import('@the-abyss/observability'),
    import('openai'),
    import('@anthropic-ai/sdk'),
  ])
  await registerObservability({
    openAI: openai.default,
    anthropic: anthropic.default,
  })
}
```

Config in `next.config`: transpile this TS-source package, and keep the Respan
runtime out of the bundle so it doesn't try to bundle Node built-ins:

```js
// next.config.js
const nextConfig = {
  transpilePackages: ['@the-abyss/observability'],
  serverExternalPackages: ['@respan/respan'],
}
```

### Node service / script

In a plain (non-bundled) Node process, auto-discovery works — call it once,
before any LLM client is created, no modules needed:

```typescript
import { registerObservability } from '@the-abyss/observability'

await registerObservability()
```

## API

### `registerObservability(instrumentModules?): Promise<boolean>`

Initializes Respan tracing once per process. **Idempotent** — repeated calls are
no-ops after the first success. Returns `true` when tracing is active, `false`
when disabled (`RESPAN_API_KEY` unset).

`instrumentModules` (optional): `{ openAI?, anthropic? }` — the SDK module
objects to instrument. Required in bundled environments (Next.js); omit in plain
Node where auto-discovery binds on its own.

## Verifying traces

```bash
npx @respan/cli auth status        # confirm the key is recognized
npx @respan/cli traces list --limit 5
```

Or open the dashboard at https://platform.respan.ai.
