// Claudesy Transformer Engine V2 — Optimizer Page
import { MagicWand } from '@phosphor-icons/react/dist/ssr'
import { OptimizerWorkspace } from '@/components/optimizer/optimizer-workspace'

export default function OptimizerPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sentra-accent-bg">
          <MagicWand className="h-5 w-5 text-sentra-accent" weight="duotone" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-sentra-text-primary">
            Prompt Optimizer
          </h1>
          <p className="text-sm text-sentra-text-secondary">
            Transform raw ideas into structured Super Prompts
          </p>
        </div>
      </div>
      <OptimizerWorkspace />
    </div>
  )
}
