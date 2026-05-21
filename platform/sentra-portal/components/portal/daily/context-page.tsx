'use client'

import useSWR from 'swr'

import { DailyPageFrame } from '../daily-page-frame'
import { PortalCard } from '../portal-card'
import { usePortalText } from '../portal-text'
import { StatusBadge } from '../status-badge'

import type { ContextPayload, PortalResponse } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()) as Promise<PortalResponse<ContextPayload>>

export function ContextDailyPage({
  embedded = false,
  panel = false,
  compact = false,
  id = 'context',
}: {
  embedded?: boolean
  panel?: boolean
  compact?: boolean
  id?: string
}) {
  const t = usePortalText()
  const frameMode = embedded || panel || compact
  const { data } = useSWR('/api/portal/context', fetcher)
  const ctx = data?.data
  const title = 'Context Capsule'
  const subtitle = 'Local handbook briefing tool.'

  if (!data?.ok && data?.error) {
    return (
      <DailyPageFrame
        embedded={frameMode}
        panel={panel}
        compact={compact}
        id={id}
        title={title}
        subtitle={subtitle}
      >
        <p className={t.error}>{data.error}</p>
      </DailyPageFrame>
    )
  }

  if (!ctx) {
    return (
      <DailyPageFrame
        embedded={frameMode}
        panel={panel}
        compact={compact}
        id={id}
        title={title}
        subtitle={subtitle}
      >
        <p className={t.bodyMuted}>Loading…</p>
      </DailyPageFrame>
    )
  }

  return (
    <DailyPageFrame
      embedded={frameMode}
      panel={panel}
      compact={compact}
      id={id}
      title={title}
      subtitle={subtitle}
    >
      <PortalCard title="Handbook">
        <dl className={cn('grid gap-3 sm:grid-cols-[120px_1fr]', t.body)}>
          <dt className={t.label}>Spec</dt>
          <dd>{ctx.specId}</dd>
          <dt className={t.label}>Status</dt>
          <dd className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ctx.freshnessStatus} label="freshness" />
            {ctx.freshnessHours != null && (
              <span className={t.bodyMuted}>{ctx.freshnessHours}h ago</span>
            )}
          </dd>
          <dt className={t.label}>Path</dt>
          <dd className={t.tableCellMono}>{ctx.handbookPath}</dd>
          {ctx.modifiedAt ? (
            <>
              <dt className={t.label}>Modified</dt>
              <dd className={t.bodyMuted}>{ctx.modifiedAt}</dd>
            </>
          ) : null}
        </dl>
        <div className="mt-4">
          <a href={ctx.openUrl} className={t.btnPrimary}>
            Open handbook
          </a>
        </div>
      </PortalCard>
    </DailyPageFrame>
  )
}
