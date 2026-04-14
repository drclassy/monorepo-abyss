import { describe, it, expect, beforeEach } from 'vitest'
import { PromptManager } from '../prompt-manager'
import { AiCoreClient, getConsensus } from '../client'
import type { PromptTemplate, ModelConfig, ModelProvider } from '../types'

describe('PromptManager', () => {
  let manager: PromptManager

  beforeEach(() => {
    manager = new PromptManager()
  })

  describe('register', () => {
    it('should register a prompt template', () => {
      const template: PromptTemplate = {
        id: 'greeting',
        name: 'Greeting Prompt',
        template: 'Hello, {{name}}!',
        variables: ['name'],
        version: '1.0.0',
      }

      manager.register(template)
      const result = manager.get('greeting')

      expect(result).toBe('Hello, {{name}}!')
    })
  })

  describe('get', () => {
    it('should return null for non-existent template', () => {
      const result = manager.get('non-existent')
      expect(result).toBeNull()
    })

    it('should return template without variable substitution', () => {
      const template: PromptTemplate = {
        id: 'simple',
        name: 'Simple Prompt',
        template: 'This is a simple prompt',
        variables: [],
        version: '1.0.0',
      }

      manager.register(template)
      const result = manager.get('simple')

      expect(result).toBe('This is a simple prompt')
    })

    it('should substitute single variable', () => {
      const template: PromptTemplate = {
        id: 'personalized',
        name: 'Personalized Greeting',
        template: 'Hello, {{name}}! Welcome to {{platform}}.',
        variables: ['name', 'platform'],
        version: '1.0.0',
      }

      manager.register(template)
      const result = manager.get('personalized', { name: 'Alice', platform: 'Sentra' })

      expect(result).toBe('Hello, Alice! Welcome to Sentra.')
    })

    it('should substitute multiple occurrences of same variable', () => {
      const template: PromptTemplate = {
        id: 'repeated',
        name: 'Repeated Variable',
        template: '{{name}} said: "My name is {{name}}"',
        variables: ['name'],
        version: '1.0.0',
      }

      manager.register(template)
      const result = manager.get('repeated', { name: 'Bob' })

      expect(result).toBe('Bob said: "My name is Bob"')
    })

    it('should handle partial variable substitution', () => {
      const template: PromptTemplate = {
        id: 'partial',
        name: 'Partial Substitution',
        template: 'Hello {{name}}, your code is {{code}}',
        variables: ['name', 'code'],
        version: '1.0.0',
      }

      manager.register(template)
      const result = manager.get('partial', { name: 'Charlie' })

      expect(result).toBe('Hello Charlie, your code is {{code}}')
    })
  })

  describe('list', () => {
    it('should return empty array when no templates registered', () => {
      const result = manager.list()
      expect(result).toHaveLength(0)
    })

    it('should return all registered templates', () => {
      const template1: PromptTemplate = {
        id: 't1',
        name: 'Template 1',
        template: 'Template 1 content',
        variables: [],
        version: '1.0.0',
      }
      const template2: PromptTemplate = {
        id: 't2',
        name: 'Template 2',
        template: 'Template 2 content',
        variables: [],
        version: '1.0.0',
      }

      manager.register(template1)
      manager.register(template2)
      const result = manager.list()

      expect(result).toHaveLength(2)
      expect(result.map((t) => t.id)).toContain('t1')
      expect(result.map((t) => t.id)).toContain('t2')
    })
  })
})

describe('AiCoreClient', () => {
  let client: AiCoreClient
  const mockConfig: ModelConfig = {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: 'test-key',
    temperature: 0.7,
    maxTokens: 1000,
  }

  beforeEach(() => {
    client = new AiCoreClient([mockConfig])
  })

  describe('generate', () => {
    it('should generate response from configured provider', async () => {
      const response = await client.generate('openai', 'Hello')

      expect(response.content).toContain('Mock response')
      expect(response.model).toBe('gpt-4')
      expect(response.provider).toBe('openai')
      expect(response.latency).toBeGreaterThanOrEqual(0)
      expect(response.usage).toBeDefined()
    })

    it('should throw error for unconfigured provider', async () => {
      await expect(client.generate('anthropic' as ModelProvider, 'Hello')).rejects.toThrow(
        'Provider anthropic not configured'
      )
    })

    it('should include usage statistics', async () => {
      const prompt = 'This is a test prompt with five words'
      const response = await client.generate('openai', prompt)

      expect(response.usage).toBeDefined()
      expect(response.usage?.promptTokens).toBe(8) // Word count (split by space)
      expect(response.usage?.completionTokens).toBe(10)
      expect(response.usage?.totalTokens).toBe(18)
    })
  })

  describe('addProvider', () => {
    it('should add new provider configuration', async () => {
      const newConfig: ModelConfig = {
        provider: 'anthropic',
        model: 'claude-3',
        apiKey: 'anthropic-key',
      }

      client.addProvider(newConfig)
      const response = await client.generate('anthropic', 'Hello')

      expect(response.provider).toBe('anthropic')
      expect(response.model).toBe('claude-3')
    })
  })

  describe('removeProvider', () => {
    it('should remove provider configuration', async () => {
      client.removeProvider('openai')

      await expect(client.generate('openai', 'Hello')).rejects.toThrow(
        'Provider openai not configured'
      )
    })
  })
})

describe('getConsensus', () => {
  it('should get consensus from multiple providers', async () => {
    const configs: ModelConfig[] = [
      { provider: 'openai', model: 'gpt-4' },
      { provider: 'anthropic', model: 'claude-3' },
    ]
    const client = new AiCoreClient(configs)

    const result = await getConsensus(client, 'What is AI?', ['openai', 'anthropic'])

    expect(result.responses).toHaveLength(2)
    expect(result.consensus).toBeDefined()
    expect(result.confidence).toBe(0.8)
    expect(result.disagreements).toEqual([])
  })

  it('should handle single provider consensus', async () => {
    const configs: ModelConfig[] = [{ provider: 'openai', model: 'gpt-4' }]
    const client = new AiCoreClient(configs)

    const result = await getConsensus(client, 'Hello', ['openai'])

    expect(result.responses).toHaveLength(1)
    expect(result.confidence).toBe(0.5)
  })

  it('should include latency in all responses', async () => {
    const configs: ModelConfig[] = [
      { provider: 'openai', model: 'gpt-4' },
      { provider: 'anthropic', model: 'claude-3' },
    ]
    const client = new AiCoreClient(configs)

    const result = await getConsensus(client, 'Test', ['openai', 'anthropic'])

    result.responses.forEach((response) => {
      expect(response.latency).toBeGreaterThanOrEqual(0)
    })
  })
})
