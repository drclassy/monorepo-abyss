// Claudesy Transformer Engine V2 — Template Grid
'use client'

import type { TemplateDefinition } from '@/types'
import { TemplateCard } from './template-card'
import { Skeleton } from '@/components/ui/skeleton'

interface TemplateGridProps {
  templates: TemplateDefinition[]
  isLoading: boolean
}

export function TemplateGrid({ templates, isLoading }: TemplateGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard key={template.slug} template={template} />
      ))}
    </div>
  )
}
