// Claudesy Transformer Engine V2 — Prompts Hook
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { PromptRecord } from '@/types'

interface PromptsState {
  prompts: PromptRecord[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
}

export function usePrompts() {
  const [state, setState] = useState<PromptsState>({
    prompts: [],
    isLoading: true,
    error: null,
    page: 1,
    totalPages: 1,
  })

  const fetchPrompts = useCallback(async (page = 1, search?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)

      const res = await fetch(`/api/prompts?${params}`)
      if (!res.ok) throw new Error('Failed to fetch prompts')

      const data = await res.json()
      setState((prev) => ({
        ...prev,
        prompts: data.prompts,
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        isLoading: false,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [])

  const deletePrompt = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setState((prev) => ({
        ...prev,
        prompts: prev.prompts.filter((p) => p.id !== id),
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Delete failed',
      }))
    }
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  return { ...state, fetchPrompts, deletePrompt }
}
