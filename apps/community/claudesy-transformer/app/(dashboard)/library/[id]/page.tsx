// Claudesy Transformer Engine V2 — Prompt Detail Page
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { CopyButton } from '@/components/optimizer/copy-button'
import type { PromptRecord } from '@/types'

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [prompt, setPrompt] = useState<PromptRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/prompts/${id}`)
        if (res.ok) {
          setPrompt(await res.json())
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sentra-text-muted">Prompt not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-1.5 text-sentra-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="border-sentra-border-medium bg-surface-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-base text-sentra-text-primary">
              Raw Input
            </CardTitle>
            <div className="flex gap-1.5">
              <Badge variant="outline" className="text-xs">{prompt.taskType}</Badge>
              <Badge variant="outline" className="text-xs">{prompt.tone}</Badge>
              <Badge variant="outline" className="text-xs">{prompt.targetLlm}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-sentra-text-body">{prompt.rawInput}</p>
        </CardContent>
      </Card>

      <Card className="border-sentra-border-medium bg-surface-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-sentra-text-primary">
              Optimized Prompt
            </CardTitle>
            <CopyButton text={prompt.optimizedText} />
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <ScrollArea className="max-h-[500px]">
            <pre className="whitespace-pre-wrap text-sm text-sentra-text-body">
              {prompt.optimizedText}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}
