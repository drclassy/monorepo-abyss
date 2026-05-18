import {
  SentraBadge,
  SentraButton,
  SentraCard,
  SentraLogo,
  SentraPanel,
} from '../../packages/sentra-ui/src'

export function SentraDemo() {
  return (
    <main className="min-h-screen bg-sentra-black p-8 text-sentra-white">
      <SentraPanel
        eyebrow="Sentra Artificial Intelligence 2026"
        title="AI, Structured."
        description="A monochrome-first enterprise AI interface layer for focused, auditable, and premium product experiences."
      >
        <div className="flex flex-wrap items-center gap-3">
          <SentraLogo />
          <SentraBadge tone="cyan">System Ready</SentraBadge>
          <SentraButton>Open Dashboard</SentraButton>
        </div>
      </SentraPanel>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SentraCard>Clinical-grade layout foundation.</SentraCard>
        <SentraCard variant="glass">Token-driven dark glass panel.</SentraCard>
        <SentraCard variant="light">Light mode document surface.</SentraCard>
      </div>
    </main>
  )
}
