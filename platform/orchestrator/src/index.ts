// @the-abyss/orchestrator - Langflow API Gateway
import { getFlowClient } from '@the-abyss/langflow-client'
import type { FlowInput } from '@the-abyss/langflow-client'

const client = getFlowClient()

export interface RunFlowRequest {
  flowId: string
  input: Record<string, unknown>
  options?: {
    shadow?: boolean
    cache?: boolean
  }
}

export interface RunFlowResponse {
  success: boolean
  data?: unknown
  metadata?: {
    flowId: string
    executionTime: number
    model?: string
  }
  error?: string
}

/**
 * Execute a Langflow
 */
export async function runFlow(request: RunFlowRequest): Promise<RunFlowResponse> {
  const startTime = Date.now()

  try {
    const flowInput: FlowInput = {
      input_value: JSON.stringify(request.input),
      input_type: 'chat',
      output_type: 'chat',
      tweaks: request.input as Record<string, unknown>,
    }

    const { output, metadata } = await client.runFlow(request.flowId, flowInput)

    return {
      success: true,
      data: output,
      metadata: {
        flowId: request.flowId,
        executionTime: Date.now() - startTime,
        model: metadata.model,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Execute flow in shadow mode (A/B testing)
 */
export async function runFlowShadow(
  primaryFlowId: string,
  shadowFlowId: string,
  input: Record<string, unknown>
) {
  const [primary, shadow] = await Promise.all([
    runFlow({ flowId: primaryFlowId, input }),
    runFlow({ flowId: shadowFlowId, input, options: { shadow: true } }),
  ])

  return {
    primary,
    shadow,
    comparison: compareResults(primary, shadow),
  }
}

function compareResults(primary: RunFlowResponse, shadow: RunFlowResponse): { matches: boolean } {
  // TODO: Implement sophisticated comparison logic
  return {
    matches: JSON.stringify(primary.data) === JSON.stringify(shadow.data),
  }
}
