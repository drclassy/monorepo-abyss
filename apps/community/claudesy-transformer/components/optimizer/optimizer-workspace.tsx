// Claudesy Transformer Engine V2 — Optimizer Workspace
'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useOptimizer } from '@/hooks/use-optimizer'
import { PromptInput } from './prompt-input'
import { OptimizerSettings } from './optimizer-settings'
import { PromptOutput } from './prompt-output'
import { ScrambleText } from './scramble-text'
import type { TaskType, PromptTone, OutputFormat, LLMProviderName } from '@/types'

export function OptimizerWorkspace() {
  const optimizer = useOptimizer()
  const searchParams = useSearchParams()

  useEffect(() => {
    const template = searchParams.get('template')
    if (template) {
      optimizer.setField('templateSlug', template)
    }
    // optimizer.setField is stable (from useOptimizer) — only re-run on searchParams change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="space-y-6">
      <PromptInput
        value={optimizer.rawIdea}
        onChange={(v) => optimizer.setField('rawIdea', v)}
        disabled={optimizer.isLoading}
      />

      <OptimizerSettings
        taskType={optimizer.taskType}
        tone={optimizer.tone}
        format={optimizer.format}
        targetLlm={optimizer.targetLlm}
        provider={optimizer.provider}
        onTaskTypeChange={(v: TaskType) => optimizer.setField('taskType', v)}
        onToneChange={(v: PromptTone) => optimizer.setField('tone', v)}
        onFormatChange={(v: OutputFormat) => optimizer.setField('format', v)}
        onTargetLlmChange={(v: LLMProviderName) => optimizer.setField('targetLlm', v)}
        onProviderChange={(v: LLMProviderName) => optimizer.setField('provider', v)}
        disabled={optimizer.isLoading}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={optimizer.optimize}
          disabled={optimizer.isLoading || !optimizer.rawIdea.trim()}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'var(--sentra-website-component-cta-button-bg)',
            boxShadow: '4px 4px 10px #050505, -4px -4px 10px #1a1a1a, inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {optimizer.isLoading ? (
            <ScrambleText text="Optimizing..." className="text-sm font-mono" loop />
          ) : (
            'Optimize Prompt'
          )}
        </button>

        {(optimizer.result || optimizer.error) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={optimizer.reset}
            className="text-sentra-text-secondary"
          >
            Reset
          </Button>
        )}
      </div>

      {optimizer.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {optimizer.error}
        </div>
      )}

      {optimizer.result && (
        <>
          <div className="flex items-center gap-2 text-sm text-green-500">
            <ScrambleText text="work is done" speed={40} />
          </div>
          <PromptOutput result={optimizer.result} />
        </>
      )}
    </div>
  )
}
