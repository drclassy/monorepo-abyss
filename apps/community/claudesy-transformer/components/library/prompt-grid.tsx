// Claudesy Transformer Engine V2 — Prompt Grid
'use client'

import type { PromptRecord } from '@/types'
import { PromptCard } from './prompt-card'
import { Skeleton } from '@/components/ui/skeleton'

interface PromptGridProps {
  prompts: PromptRecord[]
  isLoading: boolean
  onDelete?: (id: string) => void
}

export function PromptGrid({ prompts, isLoading, onDelete }: PromptGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-sentra-border-subtle">
        <p className="text-sm text-sentra-text-muted">
          No prompts saved yet. Optimize a prompt and save it to see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} onDelete={onDelete} />
      ))}
    </div>
  )
}
