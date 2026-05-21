/**
 * PORTAL — Sentra colors, strict single-scale typography (sentence case, no shouty caps).
 */
import { sentraColors } from '@sentra/design-token'

export const PORTAL_ACCENT = sentraColors.cyan

const muted = 'text-sentra-slate dark:text-sentra-silver'
const faint = 'text-sentra-silver'

export const portal = {
  layout: {
    content: 'mx-auto w-full max-w-4xl',
    workspace:
      'overflow-hidden rounded-sentraLg border border-sentra-grid bg-sentra-white dark:border-sentra-slate dark:bg-sentra-graphite',
  },

  stack: 'space-y-4',
  grid: 'gap-4',
  gridDense: 'gap-3',

  surface: {
    card: 'rounded-sentraMd border border-sentra-grid bg-sentra-white p-4 dark:border-sentra-slate/80 dark:bg-sentra-graphite/80',
    cardCompact:
      'rounded-sentraMd border border-sentra-grid bg-sentra-white p-3 dark:border-sentra-slate/80 dark:bg-sentra-graphite/80',
    inset:
      'rounded-sentraMd border border-sentra-grid/80 bg-sentra-grid/30 p-3 dark:border-sentra-slate/50 dark:bg-sentra-slate/20',
    kpi: 'px-3 py-2.5',
    metricBar:
      'rounded-sentraMd border border-sentra-grid bg-sentra-white dark:border-sentra-slate/80 dark:bg-sentra-graphite/90',
  },

  type: {
    pageTitle: `text-lg font-semibold leading-6 text-sentra-black dark:text-sentra-white`,
    pageSubtitle: `text-sm font-normal leading-5 ${muted}`,
    /** Field labels — never uppercase */
    label: `text-xs font-medium leading-4 ${faint}`,
    cardTitle: `text-sm font-semibold leading-5 text-sentra-black dark:text-sentra-white`,
    body: `text-sm font-normal leading-5 ${muted}`,
    bodyMuted: `text-sm font-normal leading-5 ${faint}`,
    /** Alias: same as label */
    section: `text-xs font-medium leading-4 ${faint}`,
    kpiLabel: `text-xs font-medium leading-4 ${faint}`,
    kpiValue: `text-sm font-semibold tabular-nums leading-5 text-sentra-black dark:text-sentra-white`,
    statValue: `text-sm font-semibold tabular-nums leading-5 text-sentra-black dark:text-sentra-white`,
    tableHead: `text-xs font-medium leading-4 ${faint}`,
    tableCell: `py-2.5 text-sm font-normal leading-5 ${muted}`,
    tableCellMono: `py-2.5 font-mono text-xs font-normal leading-4 ${muted}`,
    shellNav: `text-sm font-medium leading-5 ${muted}`,
    shellCaption: `text-xs font-normal leading-4 ${faint}`,
    navLink: `text-sm font-medium leading-5 ${muted} transition-colors hover:text-sentra-cyan`,
    accent: 'text-sentra-cyan',
    accentSoft: 'bg-sentra-cyan/10 text-sentra-cyan',
    error: `text-sm font-normal leading-5 text-sentra-critical`,
  },

  btn: {
    ghost: `inline-flex items-center gap-1.5 rounded-sentraMd border border-sentra-grid px-2.5 py-1 text-xs font-medium ${muted} transition-colors hover:bg-sentra-grid/50 dark:hover:bg-sentra-slate/40`,
    primary:
      'inline-flex items-center rounded-sentraMd bg-sentra-cyan px-3 py-1.5 text-sm font-medium text-sentra-black transition-opacity hover:opacity-90',
    link: `text-sm font-medium text-sentra-cyan hover:underline`,
  },

  tabs: {
    row: 'flex gap-1 overflow-x-auto border-b border-sentra-grid px-2 dark:border-sentra-slate/80',
    item: `shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium ${muted} transition-colors hover:text-sentra-black dark:hover:text-sentra-white`,
    itemActive:
      'shrink-0 border-b-2 border-sentra-cyan px-3 py-2.5 text-sm font-semibold text-sentra-black dark:text-sentra-white',
  },

  table: {
    wrap: 'overflow-x-auto',
    row: 'border-b border-sentra-grid/80 dark:border-sentra-slate/50',
  },
} as const
