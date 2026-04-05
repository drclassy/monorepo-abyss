'use client'

// Claudesy Transformer Engine V2 — Error Boundary
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-lg bg-surface-secondary p-6">
          <h2 className="mb-2 text-lg font-semibold text-sentra-text-primary">
            Something went wrong
          </h2>
          <p className="mb-4 text-sm text-sentra-text-secondary">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-sentra-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sentra-accent-hover"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
