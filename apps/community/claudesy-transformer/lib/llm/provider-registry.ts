// Claudesy Transformer Engine V2 — Provider Registry
import type { LLMProviderName } from '@/types'
import type { LLMProviderAdapter, ProviderConfig } from './types'
import { AnthropicProvider } from './providers/anthropic'
import { OpenAIProvider } from './providers/openai'
import { MistralProvider } from './providers/mistral'
import { GeminiProvider } from './providers/gemini'
import { QwenProvider } from './providers/qwen'
import { GrokProvider } from './providers/grok'
import { LocalProvider } from './providers/local'

const providerConstructors: Record<
  LLMProviderName,
  new (config: ProviderConfig) => LLMProviderAdapter
> = {
  CLAUDE: AnthropicProvider,
  OPENAI: OpenAIProvider,
  MISTRAL: MistralProvider,
  GEMINI: GeminiProvider,
  QWEN: QwenProvider,
  GROK: GrokProvider,
  LOCAL: LocalProvider,
}

const envKeyMap: Record<LLMProviderName, string> = {
  CLAUDE: 'ANTHROPIC_API_KEY',
  OPENAI: 'OPENAI_API_KEY',
  MISTRAL: 'MISTRAL_API_KEY',
  GEMINI: 'GOOGLE_AI_API_KEY',
  QWEN: 'QWEN_API_KEY',
  GROK: 'XAI_API_KEY',
  LOCAL: '',
}

export function getProvider(
  name: LLMProviderName,
  apiKey?: string,
  model?: string
): LLMProviderAdapter {
  const Constructor = providerConstructors[name]
  if (!Constructor) {
    throw new Error(`Unknown LLM provider: ${name}`)
  }

  const resolvedKey = apiKey || process.env[envKeyMap[name]] || ''

  if (!resolvedKey && name !== 'LOCAL') {
    throw new Error(
      `No API key provided for ${name}. Set ${envKeyMap[name]} or provide an API key.`
    )
  }

  return new Constructor({ apiKey: resolvedKey, model })
}

export function getAvailableProviders(): LLMProviderName[] {
  const available: LLMProviderName[] = []
  for (const [name, envKey] of Object.entries(envKeyMap)) {
    if (name === 'LOCAL' || process.env[envKey]) {
      available.push(name as LLMProviderName)
    }
  }
  return available
}
