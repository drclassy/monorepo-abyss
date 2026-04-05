// Architected and built by Claudesy.

export function CornerAccent({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute h-[10px] w-[10px] ${className}`}
      fill="none"
      viewBox="0 0 10 10"
    >
      <path d="M0.5 0.2V9.2M0.2 0.5H9.2" stroke="currentColor" />
    </svg>
  )
}
