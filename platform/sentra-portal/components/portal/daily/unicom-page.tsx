'use client'

import useSWR from 'swr'

import { DailyPageFrame } from '../daily-page-frame'
import { PortalCard } from '../portal-card'
import {
  PortalTable,
  PortalTableBody,
  PortalTableHead,
  PortalTd,
  PortalTh,
  PortalTr,
} from '../portal-table'
import { usePortalText } from '../portal-text'
import { StatusBadge } from '../status-badge'

import type { PortalResponse, UnicomPayload } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()) as Promise<PortalResponse<UnicomPayload>>

export function UnicomDailyPage({
  embedded = false,
  panel = false,
  compact = false,
  id = 'unicom',
}: {
  embedded?: boolean
  panel?: boolean
  compact?: boolean
  id?: string
}) {
  const t = usePortalText()
  const frameMode = embedded || panel || compact
  const { data } = useSWR('/api/portal/unicom', fetcher, { refreshInterval: 15000 })
  const unicom = data?.data
  const title = 'UNICOM Hub'
  const subtitle = 'Agent registry, delivery mode, and traffic metadata (no message bodies).'

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
        <p className={t.bodyMuted}>
          Start hub: <code className={t.tableCellMono}>pnpm --filter @the-abyss/unicom dev</code>
        </p>
      </DailyPageFrame>
    )
  }

  if (!unicom) {
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
      <div className={cn('grid grid-cols-1 md:grid-cols-3', t.grid)}>
        <PortalCard title="Hub Health">
          <StatusBadge status={unicom.health.hubStatus} label={unicom.health.status} />
          <p className={cn(t.tableCellMono, 'mt-3')}>{unicom.baseUrl}</p>
        </PortalCard>

        <PortalCard title="Agents Online">
          <p className={t.kpiValue}>{unicom.health.agents}</p>
        </PortalCard>

        <PortalCard title="Delivery">
          <p className={t.accent}>
            {unicom.deliveryMode === 'sse' ? 'SSE push' : 'Poll / inbox fallback'}
          </p>
          <p className={cn(t.bodyMuted, 'mt-2')}>
            SSE connected:{' '}
            {unicom.sseConnected.length > 0 ? unicom.sseConnected.join(', ') : 'none'}
          </p>
        </PortalCard>
      </div>

      {Object.keys(unicom.inboxDepths).length > 0 && (
        <PortalCard title="Inbox backlog">
          <div className="flex flex-wrap gap-2">
            {Object.entries(unicom.inboxDepths).map(([agentId, depth]) => (
              <span key={agentId} className={t.inset}>
                {agentId}: {depth}
              </span>
            ))}
          </div>
        </PortalCard>
      )}

      <PortalCard title="Recent traffic (metadata only)">
        {unicom.recentFeed.length === 0 ? (
          <p className={t.bodyMuted}>No messages routed yet.</p>
        ) : (
          <PortalTable>
            <PortalTableHead>
              <PortalTh>From</PortalTh>
              <PortalTh>To</PortalTh>
              <PortalTh>Type</PortalTh>
              <PortalTh>Time</PortalTh>
            </PortalTableHead>
            <PortalTableBody>
              {unicom.recentFeed.map((entry) => (
                <PortalTr key={entry.id}>
                  <PortalTd>{entry.from}</PortalTd>
                  <PortalTd>{entry.to}</PortalTd>
                  <PortalTd>{entry.type}</PortalTd>
                  <PortalTd>{new Date(entry.timestamp).toLocaleTimeString()}</PortalTd>
                </PortalTr>
              ))}
            </PortalTableBody>
          </PortalTable>
        )}
      </PortalCard>

      <PortalCard title="Agent Registry">
        {unicom.agents.length === 0 ? (
          <p className={t.bodyMuted}>No agents registered.</p>
        ) : (
          <PortalTable>
            <PortalTableHead>
              <PortalTh>Agent</PortalTh>
              <PortalTh>Status</PortalTh>
              <PortalTh>Last seen</PortalTh>
              <PortalTh>Capabilities</PortalTh>
            </PortalTableHead>
            <PortalTableBody>
              {unicom.agents.map((agent) => (
                <PortalTr key={agent.id}>
                  <PortalTd>{agent.displayName}</PortalTd>
                  <PortalTd>
                    <StatusBadge
                      status={agent.status === 'connected' ? 'ok' : 'warn'}
                      label={agent.status}
                    />
                    {agent.sseConnected && (
                      <span className={cn(t.label, 'ml-2 normal-case')}>SSE</span>
                    )}
                  </PortalTd>
                  <PortalTd>
                    {agent.lastSeenAgoSec}s
                    {(agent.inboxDepth ?? 0) > 0 && ` · inbox ${agent.inboxDepth}`}
                  </PortalTd>
                  <PortalTd>{agent.capabilities.join(', ') || '—'}</PortalTd>
                </PortalTr>
              ))}
            </PortalTableBody>
          </PortalTable>
        )}
      </PortalCard>
    </DailyPageFrame>
  )
}
