// Claudesy Transformer Engine V2 — Feedback Panel
'use client'

import type { EvaluationDimension } from '@/types'
import { cn } from '@/lib/utils'
import { getScoreColor } from '@/lib/evaluator/scoring'
import { Progress } from '@/components/ui/progress'

interface FeedbackPanelProps {
  dimensions: EvaluationDimension[]
}

export function FeedbackPanel({ dimensions }: FeedbackPanelProps) {
  return (
    <div className="space-y-4">
      {dimensions.map((dim) => (
        <div
          key={dim.key}
          className="rounded-md bg-surface-secondary p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-sentra-text-primary">
              {dim.label}
            </h4>
            <span
              className={cn(
                'text-sm font-bold',
                getScoreColor(dim.score)
              )}
            >
              {dim.score.toFixed(1)}/10
            </span>
          </div>
          <Progress value={dim.score * 10} className="h-1.5" />
          <p className="text-xs text-sentra-text-secondary">{dim.feedback}</p>
        </div>
      ))}
    </div>
  )
}
