'use client'

import {
  Activity,
  BookOpen,
  Brain,
  ChevronRight,
  FileText,
  MessageSquare,
  Terminal,
  type LucideIcon,
} from 'lucide-react'
import useSWR from 'swr'

import { ExecutiveStrip } from './executive-strip'
import { portal } from './portal-design'
import { StatusBadge } from './status-badge'

import type { PortalResponse, StripSummary } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const DOMAINS: Array<{
  id: string
  label: string
  desc: string
  icon: LucideIcon
  metric: (s: StripSummary) => string
  status: (s: StripSummary) => StripSummary['ssotStatus']
  statusLabel: (s: StripSummary) => string
}> = [
  {
    id: 'ssot',
    label: 'SSOT',
    desc: 'Handoff & progress',
    icon: FileText,
    metric: (s) => (s.ssotFreshnessHours != null ? `${s.ssotFreshnessHours}h` : '—'),
    status: (s) => s.ssotStatus,
    statusLabel: (s) => s.ssotStatus,
  },
  {
    id: 'ops',
    label: 'Ops',
    desc: 'Git & verify',
    icon: Terminal,
    metric: (s) => String(s.dirtyRisk),
    status: (s) => ((s.dirtyRisk ?? 0) > 0 ? 'critical' : 'ok'),
    statusLabel: (s) => ((s.dirtyRisk ?? 0) > 0 ? 'risk' : 'clear'),
  },
  {
    id: 'rag',
    label: 'RAG',
    desc: 'Registry & eval',
    icon: BookOpen,
    metric: (s) => s.ragReadiness,
    status: (s) =>
      s.ragReadiness === 'ready' ? 'ok' : s.ragReadiness === 'not_ready' ? 'critical' : 'unknown',
    statusLabel: (s) => s.ragReadiness,
  },
  {
    id: 'unicom',
    label: 'UNICOM',
    desc: 'Agent hub',
    icon: MessageSquare,
    metric: (s) => String(s.unicomAgents ?? '—'),
    status: (s) => s.unicomStatus,
    statusLabel: (s) => s.unicomStatus,
  },
  {
    id: 'context',
    label: 'Context',
    desc: 'Handbook tool',
    icon: Brain,
    metric: () => 'local',
    status: () => 'unknown',
    statusLabel: () => 'file',
  },
  {
    id: 'prompt',
    label: 'Prompt',
    desc: 'Audit log',
    icon: Activity,
    metric: (s) => s.verifyStatus,
    status: (s) => s.verifyStatus,
    statusLabel: (s) => s.verifyStatus,
  },
]

export function MissionControlOverview({
  onOpen,
  strip = true,
}: {
  onOpen: (id: string) => void
  strip?: boolean
}) {
  const { data } = useSWR('/api/portal/summary', (url) => fetch(url).then((r) => r.json())) as {
    data?: PortalResponse<StripSummary>
  }

  const summary = data?.data

  return (
    <div className={portal.stack}>
      {strip ? <ExecutiveStrip /> : null}

      {summary?.nextAction ? (
        <div className={portal.surface.cardCompact}>
          <p className={portal.type.label}>Next action</p>
          <p className={cn(portal.type.body, 'mt-1 line-clamp-2')}>{summary.nextAction}</p>
        </div>
      ) : null}

      <div className={cn('grid grid-cols-2', portal.gridDense)}>
        {DOMAINS.map((domain) => {
          const Icon = domain.icon
          const s = summary ?? ({} as StripSummary)
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => onOpen(domain.id)}
              className={cn(
                portal.surface.inset,
                'flex min-h-[88px] flex-col text-left transition-colors hover:border-sentra-cyan/50'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon className={cn('h-4 w-4', portal.type.accent)} />
                <ChevronRight className="h-4 w-4 text-sentra-silver" />
              </div>
              <p className={cn(portal.type.cardTitle, 'mt-2')}>{domain.label}</p>
              <p className={portal.type.bodyMuted}>{domain.desc}</p>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <span className={portal.type.kpiValue}>{summary ? domain.metric(s) : '—'}</span>
                {summary ? (
                  <StatusBadge status={domain.status(s)} label={domain.statusLabel(s)} />
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
