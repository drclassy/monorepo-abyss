import { z } from 'zod'

// ============================================
// TYPES & SCHEMAS
// ============================================

export const FlowInputSchema = z.object({
  input_value: z.string(),
  input_type: z.string().optional().default('text'),
  output_type: z.string().optional().default('text'),
  tweaks: z.record(z.string(), z.any()).optional(),
})

export type FlowInput = z.infer<typeof FlowInputSchema>

export const FlowOutputSchema = z.object({
  outputs: z.array(
    z.object({
      results: z.object({
        message: z.object({
          text: z.string(),
          sender: z.string(),
          sender_name: z.string(),
        }),
      }),
    })
  ),
  session_id: z.string().optional(),
})

export type FlowOutput = z.infer<typeof FlowOutputSchema>

export const FlowMetadataSchema = z.object({
  flowId: z.string(),
  flowVersion: z.string(),
  executionTime: z.number(),
  model: z.string().optional(),
  tokenUsage: z
    .object({
      prompt: z.number(),
      completion: z.number(),
      total: z.number(),
    })
    .optional(),
  confidence: z.number().optional(),
})

export type FlowMetadata = z.infer<typeof FlowMetadataSchema>

// ============================================
// ABYSS FLOW CLIENT
// ============================================

export interface AbyssFlowClientConfig {
  baseUrl?: string
  apiKey?: string
  timeout?: number
  retries?: number
}

export class AbyssFlowClient {
  private baseUrl: string
  private apiKey?: string
  private timeout: number
  private retries: number

  constructor(config: AbyssFlowClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.LANGFLOW_API_URL || 'http://localhost:7860'
    this.apiKey = config.apiKey || process.env.LANGFLOW_API_KEY
    this.timeout = config.timeout || 30000
    this.retries = config.retries || 3
  }

  /**
   * Run a Langflow and get the result
   */
  async runFlow(flowId: string, input: FlowInput): Promise<{ output: FlowOutput; metadata: FlowMetadata }> {
    const startTime = Date.now()
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/api/v1/run/${flowId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
          },
          body: JSON.stringify(input),
          signal: AbortSignal.timeout(this.timeout),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Flow execution failed (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        const endTime = Date.now()

        const output = FlowOutputSchema.parse(data)
        const metadata: FlowMetadata = {
          flowId,
          flowVersion: '1.0',
          executionTime: endTime - startTime,
          model: data.model || undefined,
          tokenUsage: data.token_usage || undefined,
          confidence: data.confidence || undefined,
        }

        return { output, metadata }
      } catch (error) {
        lastError = error as Error
        console.error(`[AbyssFlowClient] Attempt ${attempt}/${this.retries} failed:`, error)

        if (attempt < this.retries) {
          await this.delay(Math.pow(2, attempt) * 1000) // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Flow execution failed after all retries')
  }

  /**
   * Run flow in shadow mode (execute but don't return result)
   */
  async runFlowShadow(flowId: string, input: FlowInput): Promise<FlowMetadata> {
    try {
      const { metadata } = await this.runFlow(flowId, input)
      console.log(`[Shadow Mode] Flow ${flowId} executed successfully`, metadata)
      return metadata
    } catch (error) {
      console.error(`[Shadow Mode] Flow ${flowId} failed:`, error)
      throw error
    }
  }

  /**
   * Get available flows from Langflow
   */
  async listFlows(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const response = await fetch(`${this.baseUrl}/api/v1/flows`, {
      headers: {
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to list flows: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get flow details
   */
  async getFlow(flowId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/flows/${flowId}`, {
      headers: {
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get flow: ${response.statusText}`)
    }

    return response.json()
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

let globalClient: AbyssFlowClient | undefined

export function getFlowClient(config?: AbyssFlowClientConfig): AbyssFlowClient {
  if (!globalClient) {
    globalClient = new AbyssFlowClient(config)
  }
  return globalClient
}

export function resetFlowClient(): void {
  globalClient = undefined
}
