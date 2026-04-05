// Claudesy Transformer Engine V2 — Evaluator Page
import { Exam } from '@phosphor-icons/react/dist/ssr'
import { EvaluatorWorkspace } from '@/components/evaluator/evaluator-workspace'

export default function EvaluatorPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentra-accent-bg">
          <Exam className="h-5 w-5 text-sentra-accent" weight="duotone" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-sentra-text-primary">
            Prompt Evaluator
          </h1>
          <p className="text-sm text-sentra-text-secondary">
            Score and improve your prompts across 4 dimensions
          </p>
        </div>
      </div>
      <EvaluatorWorkspace />
    </div>
  )
}
