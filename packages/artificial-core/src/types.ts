export type ModelProvider = 'openai' | 'anthropic' | 'ollama' | 'groq'

export interface ModelConfig {
  provider: ModelProvider
  model: string
  apiKey?: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
}

export interface ModelResponse {
  content: string
  model: string
  provider: ModelProvider
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  latency: number
}

export interface ConsensusResult {
  responses: ModelResponse[]
  consensus: string
  confidence: number
  disagreements: string[]
}

export interface PromptTemplate {
  id: string
  name: string
  template: string
  variables: string[]
  version: string
}
