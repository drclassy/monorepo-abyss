// Claudesy Transformer Engine V2 — Templates Browser Page
'use client'

import { SquaresFour } from '@phosphor-icons/react'
import { useTemplates } from '@/hooks/use-templates'
import { TemplateGrid } from '@/components/templates/template-grid'
import { CategoryNav } from '@/components/templates/category-nav'

export default function TemplatesPage() {
  const { templates, isLoading, activeCategory, setCategory } = useTemplates()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentra-accent-bg">
          <SquaresFour className="h-5 w-5 text-sentra-accent" weight="duotone" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-sentra-text-primary">
            Prompt Templates
          </h1>
          <p className="text-sm text-sentra-text-secondary">
            {templates.length} templates across 8 categories
          </p>
        </div>
      </div>

      <CategoryNav activeCategory={activeCategory} onSelect={setCategory} />
      <TemplateGrid templates={templates} isLoading={isLoading} />
    </div>
  )
}
