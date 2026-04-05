// Architected and built by Claudesy.
'use client'

import Link from 'next/link'

import { CornerAccent } from '@/components/lander/CornerAccent'

type NavItem = {
  label: string
  target: string
  href?: string
}

type NavigationProps = {
  compactHeader: boolean
  hideHeader: boolean
  mobileMenuOpen: boolean
  navItems: NavItem[]
  onToggleMenu: () => void
  onScrollToTarget: (target: string) => void
}

function NavLabel({ text }: { text: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-300 ease-out group-hover/link:-translate-y-full">
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover/link:translate-y-0"
      >
        {text}
      </span>
    </span>
  )
}

function Mark({ compactHeader }: { compactHeader: boolean }) {
  return (
    <div className="flex items-center gap-3 text-[var(--text-main)]">
      <div className="relative flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-[6px] border border-white/12">
        <div className="h-[10px] w-[10px] rounded-[3px] bg-current" />
        <CornerAccent className="left-[3px] top-[3px]" />
        <CornerAccent className="right-[3px] top-[3px] rotate-90" />
        <CornerAccent className="bottom-[3px] left-[3px] -rotate-90" />
        <CornerAccent className="bottom-[3px] right-[3px] rotate-180" />
      </div>
      <div
        className={`overflow-hidden transition-[width,opacity] duration-400 ease-[cubic-bezier(.62,.16,.13,1.01)] ${
          compactHeader ? 'w-0 opacity-0' : 'w-[148px] opacity-100'
        }`}
      >
        <span className="block font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-main)]/56">
          Claudesy
        </span>
        <span className="block text-sm text-[var(--text-main)]">Memory Engine</span>
      </div>
    </div>
  )
}

export default function Navigation({
  compactHeader,
  hideHeader,
  mobileMenuOpen,
  navItems,
  onToggleMenu,
  onScrollToTarget,
}: NavigationProps) {
  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 px-4 py-4 transition-transform duration-400 ease-[cubic-bezier(.62,.16,.13,1.01)] sm:px-6 ${
        hideHeader ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div
        className={`pointer-events-auto mx-auto flex max-w-[1440px] items-center justify-between gap-4 border border-white/10 px-4 py-3 transition-all duration-400 ease-[cubic-bezier(.62,.16,.13,1.01)] ${
          compactHeader
            ? 'rounded-xl bg-[rgba(17,17,17,0.94)] backdrop-blur-md'
            : 'rounded-none bg-transparent'
        }`}
      >
        <button
          type="button"
          aria-label="Back to top"
          className="text-left"
          onClick={() => onScrollToTarget('hero')}
        >
          <Mark compactHeader={compactHeader} />
        </button>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="group/link relative block overflow-hidden px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-main)]/72 transition hover:text-[var(--text-main)]"
                  >
                    <NavLabel text={item.label} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="group/link relative block overflow-hidden px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-main)]/72 transition hover:text-[var(--text-main)]"
                    onClick={() => onScrollToTarget(item.target)}
                  >
                    <NavLabel text={item.label} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-label="Open landing navigation"
          className="relative flex h-10 w-10 items-center justify-center text-[var(--text-main)] lg:hidden"
          onClick={onToggleMenu}
        >
          <span className="h-[10px] w-[10px] rounded-[3px] bg-[var(--text-main)]" />
          <CornerAccent className="left-1 top-1" />
          <CornerAccent className="right-1 top-1 rotate-90" />
          <CornerAccent className="bottom-1 left-1 -rotate-90" />
          <CornerAccent className="bottom-1 right-1 rotate-180" />
        </button>
      </div>

      <div
        className={`pointer-events-auto mx-auto mt-2 max-w-[1440px] overflow-hidden border border-white/10 bg-[rgba(17,17,17,0.96)] p-5 transition-all duration-400 ease-[cubic-bezier(.62,.16,.13,1.01)] lg:hidden ${
          mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        style={{
          clipPath: mobileMenuOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="border-b border-white/8 pb-3 font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-main)]/82"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className="border-b border-white/8 pb-3 text-left font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-main)]/82"
                onClick={() => onScrollToTarget(item.target)}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      </div>
    </header>
  )
}
