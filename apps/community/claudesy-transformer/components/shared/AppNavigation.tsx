// Claudesy CTE V2 — Navigation for /transform route

"use client"

import Link from "next/link"
import { ArrowLeft, Zap } from "lucide-react"

export function AppNavigation() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            aria-label="Kembali ke beranda"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="font-mono text-sm font-bold tracking-wider">
              CLAUDESY CTE
            </span>
            <span className="rounded border border-black px-1.5 py-0.5 font-mono text-[10px] font-bold">
              V2
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            READY
          </span>
        </div>
      </div>
    </header>
  )
}
