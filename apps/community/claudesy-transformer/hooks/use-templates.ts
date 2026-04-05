// Claudesy Transformer Engine V2 — Templates Hook
'use client'

import { useState, useCallback, useEffect } from 'react'
import type { TemplateDefinition, TemplateCategory } from '@/types'

interface TemplatesState {
  templates: TemplateDefinition[]
  isLoading: boolean
  error: string | null
  activeCategory: TemplateCategory | null
}

export function useTemplates() {
  const [state, setState] = useState<TemplatesState>({
    templates: [],
    isLoading: true,
    error: null,
    activeCategory: null,
  })

  const fetchTemplates = useCallback(async (category?: TemplateCategory) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const params = category ? `?category=${category}` : ''
      const res = await fetch(`/api/templates${params}`)
      if (!res.ok) throw new Error('Failed to fetch templates')

      const data = await res.json()
      setState((prev) => ({
        ...prev,
        templates: data.templates,
        activeCategory: category ?? null,
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

  const setCategory = useCallback(
    (category: TemplateCategory | null) => {
      if (category) {
        fetchTemplates(category)
      } else {
        fetchTemplates()
      }
    },
    [fetchTemplates]
  )

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return { ...state, setCategory, fetchTemplates }
}
