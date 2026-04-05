// Claudesy Transformer Engine V2 — Global Loading
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sentra-accent border-t-transparent" />
        <p className="text-sm text-sentra-text-muted">Loading...</p>
      </div>
    </div>
  )
}
