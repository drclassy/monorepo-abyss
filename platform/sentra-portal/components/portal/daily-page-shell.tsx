import Link from 'next/link'
import type { ReactNode } from 'react'

import { news } from './newspaper/newspaper-design'
import { NewspaperMasthead, useNewspaperTheme } from './newspaper/newspaper-provider'
import { portal } from './portal-design'

import { cn } from '@/lib/utils'

export function DailyPageShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const newspaper = useNewspaperTheme()

  if (newspaper) {
    return (
      <div className={cn(news.page, 'min-h-screen px-6 py-8 md:px-10')}>
        <Link href="/dashboard" className={cn(news.link, 'mb-4 inline-block')}>
          ← Front page
        </Link>
        <NewspaperMasthead tagline={title} />
        {subtitle ? <p className={cn(news.bodyMuted, 'mb-6 max-w-2xl')}>{subtitle}</p> : null}
        <div className="max-w-4xl space-y-4">{children}</div>
      </div>
    )
  }

  return (
    <div className={portal.stack}>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className={portal.type.pageTitle}>{title}</h1>
          {subtitle ? (
            <p className={cn(portal.type.pageSubtitle, 'mt-1 max-w-2xl')}>{subtitle}</p>
          ) : null}
        </div>
        <Link href="/dashboard" className={portal.type.navLink}>
          ← Mission Control
        </Link>
      </header>
      {children}
    </div>
  )
}

/** @deprecated Use portal.type.section — kept for gradual migration */
export const SECTION = cn(portal.type.section, 'mb-4 block text-left')
