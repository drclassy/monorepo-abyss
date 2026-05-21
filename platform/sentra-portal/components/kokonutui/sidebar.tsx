'use client'

import { SentraMark } from '@sentra/ui'
import { BarChart2, HelpCircle, LayoutDashboard, Menu, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const T_NAV = 'text-[13px] font-medium leading-5 text-zinc-400'

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const onDashboard = pathname === '/dashboard'

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-[70] rounded-md bg-zinc-800 p-2 lg:hidden"
        onClick={() => setOpen(!open)}
      >
        <Menu className="h-4 w-4 text-zinc-200" />
      </button>
      <nav
        className={cn(
          'fixed inset-y-0 left-0 z-[70] w-[200px] border-r border-[#1F1F23] bg-[#111113] transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <Link
            href="/dashboard"
            className="flex h-14 items-center gap-2 border-b border-[#1F1F23] px-4"
            onClick={() => setOpen(false)}
          >
            <SentraMark tone="light" width={24} height={24} />
            <span className="text-sm font-semibold text-white">PORTAL</span>
          </Link>
          <div className="flex-1 p-3">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2',
                T_NAV,
                onDashboard ? 'bg-zinc-800/80 text-zinc-100' : 'hover:bg-zinc-800/50'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/ecosystem"
              onClick={() => setOpen(false)}
              className={cn(
                'mt-1 flex items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-800/50',
                T_NAV
              )}
            >
              <BarChart2 className="h-4 w-4" />
              Legacy view
            </Link>
          </div>
          <div className="space-y-1 border-t border-[#1F1F23] p-3">
            <span
              className={cn(
                'flex items-center gap-2 px-3 py-2 cursor-not-allowed opacity-50',
                T_NAV
              )}
              aria-disabled="true"
            >
              <Settings className="h-4 w-4" />
              Settings
              <span className="ml-auto text-[10px] text-zinc-600">soon</span>
            </span>
            <span
              className={cn(
                'flex items-center gap-2 px-3 py-2 cursor-not-allowed opacity-50',
                T_NAV
              )}
              aria-disabled="true"
            >
              <HelpCircle className="h-4 w-4" />
              Help
              <span className="ml-auto text-[10px] text-zinc-600">soon</span>
            </span>
          </div>
        </div>
      </nav>
      {open ? (
        <div
          className="fixed inset-0 z-[65] bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
