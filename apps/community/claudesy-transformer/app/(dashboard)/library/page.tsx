// Claudesy Transformer Engine V2 — Library Page
'use client'

import { Books } from '@phosphor-icons/react'
import { usePrompts } from '@/hooks/use-prompts'
import { PromptGrid } from '@/components/library/prompt-grid'
import { SearchBar } from '@/components/library/search-bar'

export default function LibraryPage() {
  const { prompts, isLoading, fetchPrompts, deletePrompt } = usePrompts()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentra-accent-bg">
          <Books className="h-5 w-5 text-sentra-accent" weight="duotone" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-sentra-text-primary">
            Prompt Library
          </h1>
          <p className="text-sm text-sentra-text-secondary">
            Your saved and optimized prompts
          </p>
        </div>
      </div>

      <SearchBar onSearch={(q) => fetchPrompts(1, q)} />

      <PromptGrid
        prompts={prompts}
        isLoading={isLoading}
        onDelete={deletePrompt}
      />
    </div>
  )
}
