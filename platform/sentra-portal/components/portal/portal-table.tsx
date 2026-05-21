'use client'

import type { ReactNode } from 'react'

import { useNewspaperTheme } from './newspaper/newspaper-provider'
import { portal } from './portal-design'
import { usePortalText } from './portal-text'

import { cn } from '@/lib/utils'

export function PortalTable({ children }: { children: ReactNode }) {
  return (
    <div className={portal.table.wrap}>
      <table className="w-full text-left">{children}</table>
    </div>
  )
}

export function PortalTableHead({ children }: { children: ReactNode }) {
  const newspaper = useNewspaperTheme()
  return (
    <thead>
      <tr className={newspaper ? 'border-b border-[#cccccc]' : portal.table.row}>{children}</tr>
    </thead>
  )
}

export function PortalTh({ children, className }: { children: ReactNode; className?: string }) {
  const t = usePortalText()
  return <th className={cn(t.tableHead, 'pb-3 pr-4', className)}>{children}</th>
}

export function PortalTableBody({ children }: { children: ReactNode }) {
  const newspaper = useNewspaperTheme()
  return (
    <tbody
      className={
        newspaper
          ? 'divide-y divide-[#e5e5e5]'
          : 'divide-y divide-sentra-grid dark:divide-sentra-slate/80'
      }
    >
      {children}
    </tbody>
  )
}

export function PortalTr({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>
}

export function PortalTd({
  children,
  mono,
  accent,
  className,
}: {
  children: ReactNode
  mono?: boolean
  accent?: boolean
  className?: string
}) {
  const t = usePortalText()
  return (
    <td
      className={cn(mono ? t.tableCellMono : t.tableCell, accent && t.accent, 'py-2.5', className)}
    >
      {children}
    </td>
  )
}
