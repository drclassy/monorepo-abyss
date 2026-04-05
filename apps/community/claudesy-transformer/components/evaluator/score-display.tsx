// Claudesy Transformer Engine V2 — Score Display
'use client'

import { cn } from '@/lib/utils'
import { getScoreLabel, getScoreColor } from '@/lib/evaluator/scoring'

interface ScoreDisplayProps {
  score: number
  size?: 'sm' | 'lg'
}

export function ScoreDisplay({ score, size = 'lg' }: ScoreDisplayProps) {
  const circumference = 2 * Math.PI * 40
  const progress = (score / 10) * circumference
  const colorClass = getScoreColor(score)
  const label = getScoreLabel(score)

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <span className={cn('text-lg font-bold', colorClass)}>
          {score.toFixed(1)}
        </span>
        <span className="text-xs text-sentra-text-muted">/10</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-surface-tertiary"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={colorClass}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-2xl font-bold', colorClass)}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      <span className={cn('text-sm font-medium', colorClass)}>{label}</span>
    </div>
  )
}
