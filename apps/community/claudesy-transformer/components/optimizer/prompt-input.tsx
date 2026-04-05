// Claudesy Transformer Engine V2 — Prompt Input
'use client'

import { Textarea } from '@/components/ui/textarea'
import { MAX_RAW_IDEA_LENGTH } from '@/lib/constants'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
  const charCount = value.length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-sentra-text-primary">
          Your Idea
        </label>
        <span
          className={`text-xs ${
            charCount > MAX_RAW_IDEA_LENGTH * 0.9
              ? 'text-red-400'
              : 'text-sentra-text-muted'
          }`}
        >
          {charCount.toLocaleString('en-US')} / {MAX_RAW_IDEA_LENGTH.toLocaleString('en-US')}
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Describe what you want the AI to do. Be as specific or as vague as you like — CTE will structure it into an optimized prompt..."
        className="h-[160px] resize-none bg-surface-primary text-sentra-text-body placeholder:text-sentra-text-muted"
        maxLength={MAX_RAW_IDEA_LENGTH}
      />
    </div>
  )
}
