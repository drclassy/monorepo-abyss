import { useNewspaperTheme } from './newspaper/newspaper-provider'

import type { PortalStatus } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const STYLES: Record<PortalStatus, string> = {
  ok: 'border-sentra-success/25 bg-sentra-success/10 text-sentra-success',
  warn: 'border-sentra-warning/25 bg-sentra-warning/10 text-sentra-warning',
  critical: 'border-sentra-critical/25 bg-sentra-critical/10 text-sentra-critical',
  unknown:
    'border-sentra-grid bg-sentra-grid/40 text-sentra-slate dark:border-sentra-slate dark:bg-sentra-slate/30 dark:text-sentra-silver',
}

const NEWS_STYLES: Record<PortalStatus, string> = {
  ok: 'border-[#166534] bg-[#dcfce7] text-[#166534]',
  warn: 'border-[#a16207] bg-[#fef9c3] text-[#a16207]',
  critical: 'border-[#b91c1c] bg-[#fee2e2] text-[#b91c1c]',
  unknown: 'border-[#ccc] bg-[#f5f5f5] text-[#555]',
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: PortalStatus
  label: string
  className?: string
}) {
  const newspaper = useNewspaperTheme()
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-4',
        newspaper ? NEWS_STYLES[status] : STYLES[status],
        className
      )}
    >
      {label}
    </span>
  )
}
