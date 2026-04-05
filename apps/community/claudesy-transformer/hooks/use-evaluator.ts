// Claudesy Transformer Engine V2 — Evaluator Hook
'use client'

import { useState, useCallback } from 'react'
import type { EvaluateResponse, LLMProviderName } from '@/types'

interface EvaluatorState {
  promptText: string
  provider: LLMProviderName
  isLoading: boolean
  result: EvaluateResponse | null
  error: string | null
}

export function useEvaluator() {
  const [state, setState] = useState<EvaluatorState>({
    promptText: '',
    provider: 'GROK',
    isLoading: false,
    result: null,
    error: null,
  })

  const setPromptText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, promptText: text }))
  }, [])

  const setProvider = useCallback((provider: LLMProviderName) => {
    setState((prev) => ({ ...prev, provider }))
  }, [])

  const evaluate = useCallback(async () => {
    if (!state.promptText.trim()) {
      setState((prev) => ({ ...prev, error: 'Please enter a prompt to evaluate' }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: state.promptText,
          provider: state.provider,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Evaluation failed')
      }

      const result: EvaluateResponse = await response.json()
      setState((prev) => ({ ...prev, result, isLoading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [state.promptText, state.provider])

  const reset = useCallback(() => {
    setState({
      promptText: '',
      provider: 'CLAUDE',
      isLoading: false,
      result: null,
      error: null,
    })
  }, [])

  return { ...state, setPromptText, setProvider, evaluate, reset }
}
