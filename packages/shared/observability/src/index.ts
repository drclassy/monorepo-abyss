export interface RegisterObservabilityOptions {
  openAI?: unknown
  anthropic?: unknown
}

export type ObservabilityRegistration =
  | {
      enabled: true
      reason: 'registered'
    }
  | {
      enabled: false
      reason: 'missing-api-key' | 'respan-unavailable'
      error?: unknown
    }

interface RespanTelemetryConstructor {
  new (options: {
    apiKey: string
    instrumentModules?: Record<string, unknown>
  }): RespanTelemetryInstance
}

interface RespanTelemetryInstance {
  initialize(): Promise<void>
  shutdown?(): Promise<void>
}

let registrationPromise: Promise<ObservabilityRegistration> | undefined
let telemetryInstance: RespanTelemetryInstance | undefined

export async function registerObservability(
  options: RegisterObservabilityOptions = {}
): Promise<ObservabilityRegistration> {
  registrationPromise ??= startObservability(options)
  return registrationPromise
}

export async function shutdownObservability(): Promise<void> {
  await telemetryInstance?.shutdown?.()
  telemetryInstance = undefined
  registrationPromise = undefined
}

async function startObservability(
  options: RegisterObservabilityOptions
): Promise<ObservabilityRegistration> {
  const apiKey = process.env.RESPAN_API_KEY

  if (!apiKey) {
    return {
      enabled: false,
      reason: 'missing-api-key',
    }
  }

  try {
    const moduleName = '@respan/tracing'
    const tracing = (await import(/* webpackIgnore: true */ moduleName)) as {
      RespanTelemetry?: RespanTelemetryConstructor
    }

    if (!tracing.RespanTelemetry) {
      return {
        enabled: false,
        reason: 'respan-unavailable',
      }
    }

    const instrumentModules = createInstrumentModules(options)

    telemetryInstance = new tracing.RespanTelemetry({
      apiKey,
      instrumentModules,
    })

    await telemetryInstance.initialize()

    return {
      enabled: true,
      reason: 'registered',
    }
  } catch (error) {
    return {
      enabled: false,
      reason: 'respan-unavailable',
      error,
    }
  }
}

function createInstrumentModules(
  options: RegisterObservabilityOptions
): Record<string, unknown> | undefined {
  const instrumentModules: Record<string, unknown> = {}

  if (options.openAI) {
    instrumentModules.openAI = options.openAI
  }

  if (options.anthropic) {
    instrumentModules.anthropic = options.anthropic
  }

  if (Object.keys(instrumentModules).length === 0) {
    return undefined
  }

  return instrumentModules
}
