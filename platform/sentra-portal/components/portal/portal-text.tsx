'use client'

import { news } from './newspaper/newspaper-design'
import { useNewspaperTheme } from './newspaper/newspaper-provider'
import { portal } from './portal-design'

export function usePortalText() {
  const newspaper = useNewspaperTheme()
  if (newspaper) {
    return {
      body: news.body,
      bodyMuted: news.bodyMuted,
      error: 'text-sm text-[#b91c1c]',
      label: 'text-[11px] font-medium text-[#555555]',
      statValue: news.kpi,
      kpiValue: news.kpi,
      cardTitle: 'text-sm font-semibold text-[#1a1a1a]',
      tableCellMono: 'font-mono text-xs text-[#333333]',
      tableHead: 'text-[11px] font-medium text-[#555555]',
      tableCell: news.body,
      inset: 'rounded border border-[#e5e5e5] bg-[#faf8f4] px-2 py-1 text-sm',
      btnGhost:
        'inline-flex items-center gap-1.5 border border-[#1a1a1a] bg-white px-2.5 py-1 text-xs font-medium hover:bg-[#ebe6dc]',
      btnPrimary:
        'inline-flex items-center bg-[#1a1a1a] px-3 py-1.5 text-sm font-medium text-[#f5f0e8] hover:opacity-90',
      accent: 'font-semibold text-[#1a1a1a]',
      accentSoft: 'bg-[#1a1a1a] text-[#f5f0e8]',
      heatActive: 'bg-[#1a1a1a] text-[#f5f0e8]',
      heatIdle: 'bg-[#e5e5e5] text-[#555555]',
      progressTrack: 'bg-[#e5e5e5]',
      progressFill: 'bg-[#1a1a1a]',
      listBorder: 'border-[#cccccc]',
      grid: 'gap-4',
      gridDense: 'gap-3',
    }
  }
  return {
    body: portal.type.body,
    bodyMuted: portal.type.bodyMuted,
    error: portal.type.error,
    label: portal.type.label,
    statValue: portal.type.statValue,
    kpiValue: portal.type.kpiValue,
    cardTitle: portal.type.cardTitle,
    tableCellMono: portal.type.tableCellMono,
    tableHead: portal.type.tableHead,
    tableCell: portal.type.tableCell,
    inset: portal.surface.inset,
    btnGhost: portal.btn.ghost,
    btnPrimary: portal.btn.primary,
    accent: portal.type.accent,
    accentSoft: portal.type.accentSoft,
    heatActive: portal.type.accentSoft,
    heatIdle: 'bg-sentra-grid text-sentra-silver dark:bg-sentra-slate',
    progressTrack: 'bg-sentra-grid dark:bg-sentra-slate',
    progressFill: 'bg-sentra-cyan',
    listBorder: 'border-sentra-grid dark:border-sentra-slate/80',
    grid: portal.grid,
    gridDense: portal.gridDense,
  }
}
