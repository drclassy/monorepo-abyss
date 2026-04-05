// Claudesy Transformer Engine V2 — OpenAI Provider
import OpenAI from 'openai'
import type { LLMRequest, LLMResponse } from '@/types'
import type { LLMProviderAdapter, ProviderConfig } from '../types'
import { DEFAULT_MODEL_MAP } from '@/lib/constants'

export class OpenAIProvider implements LLMProviderAdapter {
  readonly name: string = 'OPENAI'
  readonly defaultModel: string = DEFAULT_MODEL_MAP.OPENAI
  private client: OpenAI
  private model: string

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    })
    this.model = config.model ?? this.defaultModel
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
    })

    const choice = response.choices[0]
    return {
      content: choice?.message?.content ?? '',
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
      finishReason: choice?.finish_reason ?? undefined,
    }
  }

  async *generateStream(
    request: LLMRequest
  ): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: true,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch {
      return false
    }
  }
}
