/**
 * PORTAL Letta shell — one type scale, one spacing scale, one text color ramp.
 * Do not add ad-hoc text-[Npx] in dashboard; use these tokens only.
 */
import type { PortalStatus } from '@/lib/portal/types'
import { cn } from '@/lib/utils'

/** 13px body · 15px title · 22px page — nothing else for UI copy */
export const lettaUi = {
  pageTitle: 'text-[22px] font-semibold leading-7 text-white',
  sectionTitle: 'text-[15px] font-semibold leading-5 text-white',
  body: 'text-[13px] font-normal leading-5 text-zinc-400',
  bodyStrong: 'text-[13px] font-medium leading-5 text-zinc-300',
  caption: 'text-[13px] font-normal leading-5 text-zinc-500',
  mono: 'font-mono text-[13px] font-normal leading-5 text-zinc-400',
  tab: 'text-[13px] font-medium leading-5',
  link: 'text-[13px] font-medium leading-5',

  padPanel: 'p-5',
  padHeader: 'px-5 py-4',
  gapPage: 'mb-8',
  gapSection: 'mb-8',
  gapBlock: 'space-y-4',
  gapList: 'space-y-0',
  gapActions: 'mt-4 flex flex-wrap items-center gap-4',

  card: 'rounded-xl border border-[#1f1f23] bg-[#111113]',
  border: 'border-[#1f1f23]',
} as const

export function statusTone(status: PortalStatus | string): string {
  if (
    status === 'ok' ||
    status === 'ready' ||
    status === 'pass' ||
    status === 'clear' ||
    status === 'fresh'
  )
    return 'text-emerald-400/90'
  if (status === 'warn' || status === 'degraded' || status === 'not_ready' || status === 'stale')
    return 'text-amber-400/90'
  if (status === 'critical' || status === 'risk' || status === 'fail') return 'text-red-400/90'
  return 'text-zinc-400'
}

export function MetricRow({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status?: PortalStatus | string
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-2.5 last:border-b-0">
      <span className={lettaUi.body}>{label}</span>
      <span className={cn(lettaUi.bodyStrong, 'tabular-nums', status ? statusTone(status) : '')}>
        {value}
      </span>
    </div>
  )
}
