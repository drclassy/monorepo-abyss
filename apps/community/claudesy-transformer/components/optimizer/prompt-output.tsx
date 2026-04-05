// Claudesy Transformer Engine V2 — Prompt Output Display
'use client'

import type { OptimizeResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CopyButton } from './copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PromptOutputProps {
  result: OptimizeResponse
}

export function PromptOutput({ result }: PromptOutputProps) {
  const { superPrompt, metadata } = result

  return (
    <Card className="border-sentra-border-medium bg-surface-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-sentra-text-primary">
            Super Prompt
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {metadata.provider} / {metadata.model}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {metadata.latencyMs}ms
            </Badge>
            {metadata.templateUsed && (
              <Badge variant="secondary" className="text-xs">
                {metadata.templateUsed}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <Tabs defaultValue="full" className="w-full">
          <div className="mb-3 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="full">Full Prompt</TabsTrigger>
              <TabsTrigger value="structured">Structured</TabsTrigger>
            </TabsList>
            <CopyButton
              text={[
                superPrompt.role && `## Role\n${superPrompt.role}`,
                superPrompt.task && `## Task\n${superPrompt.task}`,
                superPrompt.context && `## Context\n${superPrompt.context}`,
                superPrompt.chainOfThought && `## Chain of Thought\n${superPrompt.chainOfThought}`,
                superPrompt.constraints.length > 0 && `## Constraints\n${superPrompt.constraints.map((c) => `• ${c}`).join('\n')}`,
                superPrompt.formatSpec && `## Format Spec\n${superPrompt.formatSpec}`,
              ].filter(Boolean).join('\n\n')}
            />
          </div>

          <TabsContent value="full">
            <div className="relative">
              <CopyButton
                text={superPrompt.fullPrompt}
                className="absolute right-2 top-2"
              />
              <ScrollArea className="h-[400px]">
                <div className="rounded-md bg-surface-secondary p-4 text-sm leading-relaxed text-sentra-text-body">
                  {superPrompt.fullPrompt.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-3 last:mb-0 whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="structured" className="space-y-3">
            {superPrompt.role && (
              <StructuredSection title="Role" content={superPrompt.role} />
            )}
            {superPrompt.task && (
              <StructuredSection title="Task" content={superPrompt.task} />
            )}
            {superPrompt.context && (
              <StructuredSection title="Context" content={superPrompt.context} />
            )}
            {superPrompt.chainOfThought && (
              <StructuredSection
                title="Chain of Thought"
                content={superPrompt.chainOfThought}
              />
            )}
            {superPrompt.constraints.length > 0 && (
              <StructuredSection
                title="Constraints"
                content={superPrompt.constraints.map((c) => `• ${c}`).join('\n')}
              />
            )}
            {superPrompt.formatSpec && (
              <StructuredSection
                title="Format Spec"
                content={superPrompt.formatSpec}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function StructuredSection({
  title,
  content,
}: {
  title: string
  content: string
}) {
  return (
    <div className="rounded-md bg-surface-secondary p-3">
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-sentra-text-secondary">
          {title}
        </h4>
        <CopyButton text={content} size="icon" />
      </div>
      <p className="whitespace-pre-wrap text-sm text-sentra-text-body">
        {content}
      </p>
    </div>
  )
}
