import type { ReactNode } from 'react'

import { DailyPageShell } from './daily-page-shell'
import { news } from './newspaper/newspaper-design'
import { useNewspaperTheme } from './newspaper/newspaper-provider'
import { portal } from './portal-design'

import { cn } from '@/lib/utils'

export function DailyPageFrame({
  embedded = false,
  panel = false,
  compact = false,
  id,
  title,
  subtitle,
  children,
}: {
  embedded?: boolean
  /** In tab panel: no duplicate section title (parent supplies header). */
  panel?: boolean
  /** Tighter inline block for single-page dashboard. */
  compact?: boolean
  id?: string
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const newspaper = useNewspaperTheme()

  if (embedded && panel) {
    return <div className="space-y-4">{children}</div>
  }

  if (embedded && compact && panel) {
    return <div className="space-y-3">{children}</div>
  }

  if (embedded && compact) {
    return (
      <section id={id} className="scroll-mt-16 space-y-2">
        <div>
          <h2
            className="text-sm font-bold"
            style={{ fontFamily: 'var(--font-portal-serif), Georgia, serif' }}
          >
            {title}
          </h2>
          {subtitle ? <p className={cn(news.bodyMuted, 'text-xs')}>{subtitle}</p> : null}
        </div>
        {children}
      </section>
    )
  }

  if (embedded) {
    return (
      <section
        id={id}
        className={cn(
          'space-y-4 scroll-mt-20 border-t pt-8 first:border-t-0 first:pt-2',
          newspaper ? 'border-[#ccc]' : 'border-sentra-grid dark:border-sentra-slate/80'
        )}
      >
        <div>
          <h2 className={newspaper ? news.columnTitle : portal.type.section}>{title}</h2>
          {subtitle ? (
            <p className={cn(newspaper ? news.bodyMuted : portal.type.bodyMuted, 'mt-1')}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </section>
    )
  }

  return (
    <DailyPageShell title={title} subtitle={subtitle}>
      {children}
    </DailyPageShell>
  )
}
