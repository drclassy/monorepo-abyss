// Claudesy Transformer Engine V2 — Improvement Suggestions
'use client'

import { Lightbulb } from '@phosphor-icons/react'

interface ImprovementSuggestionsProps {
  suggestions: string[]
}

export function ImprovementSuggestions({
  suggestions,
}: ImprovementSuggestionsProps) {
  if (suggestions.length === 0) return null

  return (
    <div className="rounded-md bg-surface-secondary p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-sentra-text-primary">
        <Lightbulb className="h-4 w-4 text-yellow-400" />
        Improvement Suggestions
      </h4>
      <ul className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm text-sentra-text-secondary"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-xs text-sentra-text-muted">
              {i + 1}
            </span>
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  )
}
