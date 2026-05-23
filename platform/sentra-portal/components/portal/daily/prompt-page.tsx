'use client'

import useSWR from 'swr'

import { DailyPageFrame } from '../daily-page-frame'
import { PortalCard, PortalStat, PortalStatGrid } from '../portal-card'
import { usePortalText } from '../portal-text'

import type { PortalResponse, PromptPayload } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()) as Promise<PortalResponse<PromptPayload>>

export function PromptDailyPage({
  embedded = false,
  panel = false,
  compact = false,
  id = 'prompt',
}: {
  embedded?: boolean
  panel?: boolean
  compact?: boolean
  id?: string
}) {
  const t = usePortalText()
  const frameMode = embedded || panel || compact
  const { data } = useSWR('/api/portal/prompt', fetcher)
  const prompt = data?.data
  const title = 'Sentra Prompt'
  const subtitle = 'Codex prompt audit rubric and extension health.'

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

  if (!prompt) {
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

  const total = prompt.auditStats.total || 1

  return (
    <DailyPageFrame
      embedded={frameMode}
      panel={panel}
      compact={compact}
      id={id}
      title={title}
      subtitle={subtitle}
    >
      <PortalStatGrid>
        <PortalStat label="Extension" value={`v${prompt.extensionVersion}`} />
        <PortalStat label="Audits" value={String(prompt.auditStats.total)} />
        <PortalStat label="Ready" value={String(prompt.auditStats.ready)} />
        <PortalStat label="Needs work" value={String(prompt.auditStats.needsWork)} />
      </PortalStatGrid>

      <PortalCard title="Decision mix">
        <div className={cn('flex h-3 overflow-hidden rounded-full', t.progressTrack)}>
          <div
            className="bg-[#166534]"
            style={{ width: `${(prompt.auditStats.ready / total) * 100}%` }}
          />
          <div
            className="bg-[#a16207]"
            style={{ width: `${(prompt.auditStats.needsWork / total) * 100}%` }}
          />
          <div
            className="bg-[#b91c1c]"
            style={{ width: `${(prompt.auditStats.unsafe / total) * 100}%` }}
          />
        </div>
        <p className={cn(t.bodyMuted, 'mt-3')}>
          Unsafe: {prompt.auditStats.unsafe} · Log:{' '}
          <code className={t.tableCellMono}>{prompt.auditLogPath}</code>
        </p>
      </PortalCard>

      <PortalCard title="Recent findings">
        {prompt.recentFindings.length === 0 ? (
          <p className={t.bodyMuted}>
            No audit log yet. Run Sentra Prompt audit from the monorepo; entries append to{' '}
            <code className={t.tableCellMono}>{prompt.auditLogPath}</code>.
          </p>
        ) : (
          <ul className={t.body}>
            {prompt.recentFindings.map((f, i) => (
              <li
                key={`${f.title}-${i}`}
                className={cn('flex justify-between py-3 border-b', t.listBorder)}
              >
                <span>{f.title}</span>
                <span className={t.bodyMuted}>
                  {f.severity} · {f.decision}
                </span>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      <p className={t.bodyMuted}>
        Package: <code className={t.tableCellMono}>{prompt.packagePath}</code> — Sentra Prompt:
        Audit Codex Prompt
      </p>
    </DailyPageFrame>
  )
}
