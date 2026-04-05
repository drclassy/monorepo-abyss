// Claudesy Transformer Engine V2 — LLM Config Hook
'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ProviderKeyListResponseSchema,
  type LLMProviderName,
  type ProviderKeySource,
} from '@/types'

interface ProviderKeyState {
  provider: LLMProviderName
  hasKey: boolean
  source: ProviderKeySource
}

interface LLMConfigState {
  providers: ProviderKeyState[]
  isLoading: boolean
  error: string | null
}

const ALL_PROVIDERS: LLMProviderName[] = [
  'CLAUDE', 'OPENAI', 'MISTRAL', 'GEMINI', 'QWEN', 'GROK', 'LOCAL',
]

export function useLLMConfig() {
  const [state, setState] = useState<LLMConfigState>({
    providers: ALL_PROVIDERS.map((p) => ({ provider: p, hasKey: false, source: p === 'LOCAL' ? 'LOCAL' : 'NONE' })),
    isLoading: true,
    error: null,
  })

  const refreshProviders = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/provider-keys', {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load provider configuration')
      }

      const parsed = ProviderKeyListResponseSchema.parse(payload)
      setState({
        providers: parsed.providers,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load provider configuration',
      }))
    }
  }, [])

  useEffect(() => {
    void refreshProviders()
  }, [refreshProviders])

  const saveApiKey = useCallback(
    async (provider: LLMProviderName, apiKey: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch('/api/provider-keys', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, apiKey }),
        })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to save key')
        }

        const parsed = ProviderKeyListResponseSchema.parse(payload)
        setState({
          providers: parsed.providers,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to save key',
        }))
      }
    },
    []
  )

  const removeApiKey = useCallback(async (provider: LLMProviderName) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/provider-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to remove key')
      }

      const parsed = ProviderKeyListResponseSchema.parse(payload)
      setState({
        providers: parsed.providers,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to remove key',
      }))
    }
  }, [])

  return { ...state, saveApiKey, removeApiKey, refreshProviders }
}
