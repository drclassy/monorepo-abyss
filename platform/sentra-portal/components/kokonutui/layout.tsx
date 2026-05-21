'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import Sidebar from './sidebar'
import TopNav from './top-nav'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const missionHome = pathname === '/dashboard'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading PORTAL…</p>
      </div>
    )
  }

  return (
    <div className="portal-letta dark flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        {!missionHome ? (
          <header>
            <TopNav />
          </header>
        ) : null}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {missionHome ? (
            <div className="min-h-0 flex-1">{children}</div>
          ) : (
            <div className="mx-auto w-full max-w-[1000px] flex-1 overflow-auto px-6 py-8 lg:px-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
