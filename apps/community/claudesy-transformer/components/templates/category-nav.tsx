// Claudesy Transformer Engine V2 — Category Navigation
'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { TemplateCategory } from '@/types'

const CATEGORIES: { value: TemplateCategory | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'CODING', label: 'Coding' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'ANALYSIS', label: 'Analysis' },
  { value: 'CREATIVE', label: 'Creative' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'MARKETING', label: 'Marketing' },
]

interface CategoryNavProps {
  activeCategory: TemplateCategory | null
  onSelect: (category: TemplateCategory | null) => void
}

export function CategoryNav({ activeCategory, onSelect }: CategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.label}
          variant="ghost"
          size="sm"
          onClick={() => onSelect(cat.value)}
          className={cn(
            'text-xs',
            activeCategory === cat.value
              ? 'bg-sentra-accent-bg text-sentra-accent'
              : 'text-sentra-text-secondary'
          )}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
