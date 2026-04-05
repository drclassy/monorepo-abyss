// Claudesy CTE V2 — Prompt history hook (localStorage-backed)

"use client"

import { useState, useCallback } from "react"
import type { HistoryItem } from "@/lib/transform/schemas"
import {
  getHistory,
  addToHistory,
  removeFromHistory,
  toggleStar,
  clearHistory,
} from "@/lib/transform/storage"

interface UsePromptHistoryReturn {
  history: HistoryItem[]
  addItem: (item: HistoryItem) => void
  removeItem: (id: string) => void
  toggleStarItem: (id: string) => void
  clearAll: () => void
}

export function usePromptHistory(): UsePromptHistoryReturn {
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory())

  const addItem = useCallback((item: HistoryItem) => {
    const updated = addToHistory(item)
    setHistory(updated)
  }, [])

  const removeItem = useCallback((id: string) => {
    const updated = removeFromHistory(id)
    setHistory(updated)
  }, [])

  const toggleStarItem = useCallback((id: string) => {
    const updated = toggleStar(id)
    setHistory(updated)
  }, [])

  const clearAll = useCallback(() => {
    const updated = clearHistory()
    setHistory(updated)
  }, [])

  return { history, addItem, removeItem, toggleStarItem, clearAll }
}
