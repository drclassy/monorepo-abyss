// Claudesy Transformer Engine V2 — Template Detail Page
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MagicWand } from '@phosphor-icons/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { TemplateDefinition } from '@/types'

export default function TemplateDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [template, setTemplate] = useState<TemplateDefinition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/templates/${slug}`)
        if (res.ok) setTemplate(await res.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sentra-text-muted">Template not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-sentra-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Link href={`/optimizer?template=${template.slug}`}>
          <Button size="sm" className="gap-1.5 bg-sentra-accent text-white hover:bg-sentra-accent-hover">
            <MagicWand className="h-3.5 w-3.5" />
            Use Template
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-sentra-text-primary">
          {template.name}
        </h1>
        <p className="mt-1 text-sm text-sentra-text-secondary">
          {template.description}
        </p>
        <Badge variant="outline" className="mt-2 text-xs">
          {template.category}
        </Badge>
      </div>

      <Card className="border-sentra-border-medium bg-surface-primary">
        <CardHeader>
          <CardTitle className="text-sm">Role</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-sentra-text-body">{template.template.role}</p>
        </CardContent>
      </Card>

      <Card className="border-sentra-border-medium bg-surface-primary">
        <CardHeader>
          <CardTitle className="text-sm">Task Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-sentra-text-body">
            {template.template.taskStructure}
          </p>
        </CardContent>
      </Card>

      <Card className="border-sentra-border-medium bg-surface-primary">
        <CardHeader>
          <CardTitle className="text-sm">Constraints</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {template.template.constraints.map((c, i) => (
              <li key={i} className="text-sm text-sentra-text-secondary">
                • {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {template.variables.length > 0 && (
        <Card className="border-sentra-border-medium bg-surface-primary">
          <CardHeader>
            <CardTitle className="text-sm">Variables</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="space-y-3">
              {template.variables.map((v) => (
                <div key={v.name} className="flex items-start justify-between gap-4">
                  <div>
                    <code className="text-xs text-sentra-accent">{`{{${v.name}}}`}</code>
                    <p className="text-xs text-sentra-text-secondary">{v.description}</p>
                  </div>
                  <Badge variant={v.required ? 'default' : 'outline'} className="shrink-0 text-[10px]">
                    {v.required ? 'Required' : 'Optional'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
