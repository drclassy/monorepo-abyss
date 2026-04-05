// Claudesy Transformer Engine V2 — Prompt Card
'use client'

import Link from 'next/link'
import type { PromptRecord } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface PromptCardProps {
  prompt: PromptRecord
  onDelete?: (id: string) => void
}

export function PromptCard({ prompt, onDelete }: PromptCardProps) {
  return (
    <Card className="group border-sentra-border-subtle bg-surface-primary transition-colors hover:border-sentra-border-medium">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/library/${prompt.id}`}
            className="flex-1 text-sm font-medium text-sentra-text-primary hover:text-sentra-accent"
          >
            {prompt.rawInput.slice(0, 80)}
            {prompt.rawInput.length > 80 ? '...' : ''}
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(prompt.id)}
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
            >
              <Trash className="h-3.5 w-3.5 text-red-400" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-3 line-clamp-2 text-xs text-sentra-text-secondary">
          {prompt.optimizedText.slice(0, 150)}...
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {prompt.taskType}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {prompt.targetLlm}
          </Badge>
          {prompt.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
