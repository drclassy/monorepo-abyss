// Claudesy Transformer Engine V2 — Google Gemini Provider
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LLMRequest, LLMResponse } from '@/types'
import type { LLMProviderAdapter, ProviderConfig } from '../types'
import { DEFAULT_MODEL_MAP } from '@/lib/constants'

export class GeminiProvider implements LLMProviderAdapter {
  readonly name = 'GEMINI'
  readonly defaultModel = DEFAULT_MODEL_MAP.GEMINI
  private genAI: GoogleGenerativeAI
  private model: string

  constructor(config: ProviderConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey)
    this.model = config.model ?? this.defaultModel
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: request.systemPrompt,
      generationConfig: {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature,
      },
    })

    const result = await model.generateContent(request.userPrompt)
    const response = result.response

    return {
      content: response.text(),
      model: this.model,
      tokensUsed: response.usageMetadata
        ? (response.usageMetadata.promptTokenCount ?? 0) +
          (response.usageMetadata.candidatesTokenCount ?? 0)
        : undefined,
      finishReason: response.candidates?.[0]?.finishReason ?? undefined,
    }
  }

  async *generateStream(
    request: LLMRequest
  ): AsyncGenerator<string, void, unknown> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: request.systemPrompt,
      generationConfig: {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature,
      },
    })

    const result = await model.generateContentStream(request.userPrompt)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) yield text
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model })
      await model.generateContent('test')
      return true
    } catch {
      return false
    }
  }
}
