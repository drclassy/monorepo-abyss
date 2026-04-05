// Claudesy Transformer Engine V2 — Template Card
'use client'

import Link from 'next/link'
import type { TemplateDefinition } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TemplateCardProps {
  template: TemplateDefinition
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link href={`/templates/${template.slug}`}>
      <Card className="h-full border-sentra-border-subtle bg-surface-primary transition-colors hover:border-sentra-border-medium">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-sentra-text-primary">
            {template.name}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="mb-3 line-clamp-2 text-xs text-sentra-text-secondary">
            {template.description}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {template.category}
            </Badge>
            <span className="text-[10px] text-sentra-text-muted">
              {template.variables.length} variables
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
