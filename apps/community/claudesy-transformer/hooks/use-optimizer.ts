// Claudesy Transformer Engine V2 — Optimizer Hook
'use client'

import { useState, useCallback } from 'react'
import type {
  OptimizeRequest,
  OptimizeResponse,
  TaskType,
  PromptTone,
  OutputFormat,
  LLMProviderName,
} from '@/types'

interface OptimizerState {
  rawIdea: string
  taskType: TaskType
  tone: PromptTone
  format: OutputFormat
  targetLlm: LLMProviderName
  provider: LLMProviderName
  templateSlug: string
  isLoading: boolean
  result: OptimizeResponse | null
  error: string | null
}

const initialState: OptimizerState = {
  rawIdea: '',
  taskType: 'GENERAL',
  tone: 'PROFESSIONAL',
  format: 'STRUCTURED',
  targetLlm: 'GROK',
  provider: 'GROK',
  templateSlug: '',
  isLoading: false,
  result: null,
  error: null,
}

export function useOptimizer() {
  const [state, setState] = useState<OptimizerState>(initialState)

  const setField = useCallback(
    <K extends keyof OptimizerState>(key: K, value: OptimizerState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const optimize = useCallback(async () => {
    if (!state.rawIdea.trim()) {
      setState((prev) => ({ ...prev, error: 'Please enter an idea to optimize' }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const body: OptimizeRequest = {
        rawIdea: state.rawIdea,
        taskType: state.taskType,
        tone: state.tone,
        format: state.format,
        targetLlm: state.targetLlm,
        provider: state.provider,
        ...(state.templateSlug && { templateSlug: state.templateSlug }),
      }

      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Optimization failed')
      }

      const result: OptimizeResponse = await response.json()
      setState((prev) => ({ ...prev, result, isLoading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [state.rawIdea, state.taskType, state.tone, state.format, state.targetLlm, state.provider, state.templateSlug])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return { ...state, setField, optimize, reset }
}
