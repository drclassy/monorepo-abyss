// Claudesy Transformer Engine V2 — Evaluator Workspace
'use client'

import { Exam, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEvaluator } from '@/hooks/use-evaluator'
import { ScoreDisplay } from './score-display'
import { FeedbackPanel } from './feedback-panel'
import { ImprovementSuggestions } from './improvement-suggestions'
import type { LLMProviderName } from '@/types'
import { Badge } from '@/components/ui/badge'

const PROVIDERS: { value: LLMProviderName; label: string }[] = [
  { value: 'CLAUDE', label: 'Claude' },
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'MISTRAL', label: 'Mistral' },
  { value: 'GEMINI', label: 'Gemini' },
  { value: 'QWEN', label: 'Qwen' },
  { value: 'GROK', label: 'Grok' },
  { value: 'LOCAL', label: 'Local (Ollama)' },
]

export function EvaluatorWorkspace() {
  const evaluator = useEvaluator()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-sentra-text-primary">
          Prompt to Evaluate
        </label>
        <Textarea
          value={evaluator.promptText}
          onChange={(e) => evaluator.setPromptText(e.target.value)}
          disabled={evaluator.isLoading}
          placeholder="Paste any prompt here to get a quality score and improvement suggestions..."
          className="min-h-[200px] resize-y bg-surface-primary text-sentra-text-body placeholder:text-sentra-text-muted"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="w-48 space-y-1.5">
          <label className="text-xs font-medium text-sentra-text-secondary">
            Evaluation Provider
          </label>
          <Select
            value={evaluator.provider}
            onValueChange={(v: LLMProviderName) => evaluator.setProvider(v)}
            disabled={evaluator.isLoading}
          >
            <SelectTrigger className="h-9 bg-surface-primary text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-3 pt-5">
          <Button
            onClick={evaluator.evaluate}
            disabled={evaluator.isLoading || !evaluator.promptText.trim()}
            className="gap-2 bg-sentra-accent text-white hover:bg-sentra-accent-hover"
          >
            {evaluator.isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Evaluating...
              </>
            ) : (
              <>
                <Exam className="h-4 w-4" />
                Evaluate
              </>
            )}
          </Button>

          {(evaluator.result || evaluator.error) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={evaluator.reset}
              className="gap-1.5 text-sentra-text-secondary"
            >
              <ArrowCounterClockwise className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {evaluator.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {evaluator.error}
        </div>
      )}

      {evaluator.result && (
        <Card className="border-sentra-border-medium bg-surface-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-sentra-text-primary">
                Evaluation Results
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {evaluator.result.metadata.provider} /{' '}
                  {evaluator.result.metadata.model}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {evaluator.result.metadata.latencyMs}ms
                </Badge>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="grid gap-6 md:grid-cols-[auto_1fr]">
              <ScoreDisplay score={evaluator.result.overallScore} />
              <div className="space-y-4">
                <FeedbackPanel dimensions={evaluator.result.dimensions} />
                <ImprovementSuggestions
                  suggestions={evaluator.result.suggestions}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
