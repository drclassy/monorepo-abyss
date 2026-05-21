import type { ReactNode } from 'react'

import { news } from './newspaper/newspaper-design'
import { useNewspaperTheme } from './newspaper/newspaper-provider'
import { portal } from './portal-design'

import { cn } from '@/lib/utils'

export function PortalCard({
  title,
  children,
  className,
  compact,
}: {
  title?: string
  children: ReactNode
  className?: string
  compact?: boolean
}) {
  const newspaper = useNewspaperTheme()
  return (
    <section
      className={cn(
        newspaper
          ? cn(news.card, compact && 'p-3 mb-2 shadow-none')
          : compact
            ? portal.surface.cardCompact
            : portal.surface.card,
        className
      )}
    >
      {title ? (
        <h3
          className={cn(newspaper ? news.cardTitle : portal.type.cardTitle, !newspaper && 'mb-3')}
        >
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  )
}

export function PortalStatGrid({ children }: { children: ReactNode }) {
  return <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4')}>{children}</div>
}

export function PortalStat({ label, value }: { label: string; value: string }) {
  const newspaper = useNewspaperTheme()
  return (
    <div
      className={
        newspaper ? 'rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-3' : portal.surface.inset
      }
    >
      <p className={newspaper ? 'text-[11px] font-medium text-[#64748b]' : portal.type.label}>
        {label}
      </p>
      <p className={cn(newspaper ? news.kpi : portal.type.statValue, 'mt-1')}>{value}</p>
    </div>
  )
}
