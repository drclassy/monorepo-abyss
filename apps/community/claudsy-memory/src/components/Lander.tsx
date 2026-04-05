// Architected and built by Claudesy.
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import Hero from '@/components/lander/Hero'
import Navigation from '@/components/lander/Navigation'
import { CapabilitiesSection } from '@/components/landing/CapabilitiesSection'
import { ShowcaseSection } from '@/components/landing/ShowcaseSection'

type NavItem = {
  label: string
  target: string
  href?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'HOW IT WORKS', target: 'hero' },
  { label: 'CAPABILITIES', target: 'ethos' },
  { label: 'TECHNOLOGY', target: 'focus' },
  { label: 'UPDATES', target: 'focus' },
  { label: 'OPEN DASHBOARD', target: 'dashboard', href: '/dashboard' },
]

const ETHOS_CARDS = [
  {
    title: 'Semantic Memory',
    copy: 'Factual knowledge extraction and durable retrieval across every agent session.',
    accent: 'bg-[var(--c-asesmen)]',
  },
  {
    title: 'Episodic Memory',
    copy: 'Session continuity that preserves operational context instead of resetting every turn.',
    accent: 'bg-[#5c939f]',
  },
  {
    title: 'Procedural Memory',
    copy: 'Workflow patterns and learned execution paths that harden over time.',
    accent: 'bg-[#27ae60]',
  },
  {
    title: 'Multi-Agent Memory',
    copy: 'Isolated memory lanes with shared consolidation for coordinated fleets.',
    accent: 'bg-[#df7a52]',
  },
] as const

function EthosSection({
  activeCard,
  onActiveCardChange,
}: {
  activeCard: number
  onActiveCardChange: (index: number) => void
}) {
  return (
    <section id="ethos" className="bg-[#dadada] text-[#111111]">
      <div className="mx-auto max-w-[1440px] rounded-t-[20px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#111111]/52">
              Our Vision
            </p>
            <h2 className="mt-5 text-[clamp(2.2rem,5vw,4.7rem)] uppercase leading-[0.92] tracking-[-0.05em]">
              Intelligence persists. Context compounds.
            </h2>
            <p className="mt-5 max-w-[520px] text-sm leading-7 text-[#111111]/72 sm:text-base">
              Empat kategori memori ini dibangun untuk menjaga kontinuitas kerja
              nyata, bukan sekadar menambah cache sementara.
            </p>
          </div>

          <div className="flex items-start justify-start lg:justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-[#111111]/14 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.24em] transition hover:border-[#111111]/30 hover:bg-[#111111] hover:text-[#dadada]"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 lg:flex-row">
          {ETHOS_CARDS.map((card, index) => {
            const desktopWidth =
              activeCard === index ? 'lg:flex-[1.8]' : 'lg:flex-[0.9]'

            return (
              <article
                key={card.title}
                className={`group relative flex min-h-[260px] flex-1 flex-col justify-between overflow-hidden rounded-[20px] bg-[#111111] px-6 py-6 text-[#dadada] transition-[flex,transform] duration-500 ease-[cubic-bezier(.62,.16,.13,1.01)] ${desktopWidth}`}
                onMouseEnter={() => onActiveCardChange(index)}
                onMouseLeave={() => onActiveCardChange(0)}
              >
                <div>
                  <div className={`h-2 w-12 rounded-full ${card.accent}`} />
                  <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.24em] text-[#dadada]/48">
                    0{index + 1}
                  </p>
                  <h3 className="mt-4 text-[clamp(1.65rem,2.4vw,2.5rem)] uppercase leading-[0.95] tracking-[-0.04em]">
                    {card.title}
                  </h3>
                </div>

                <p className="max-w-[27ch] text-sm leading-7 text-[#dadada]/70">
                  {card.copy}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FocusSection({ visible }: { visible: boolean }) {
  return (
    <section
      id="focus"
      className="flex min-h-screen items-center overflow-hidden border-t border-white/8 px-4 sm:px-6 lg:px-10"
    >
      <div
        className={`mx-auto flex w-full max-w-[895px] flex-col items-center text-center transition-all duration-700 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--text-main)]/46">
          Our Focus
        </p>
        <h2 className="mt-5 text-[clamp(2.3rem,6vw,5.2rem)] uppercase leading-[0.9] tracking-[-0.05em] text-[#f5f5f5]">
          Four Memory Categories. One Unified Engine.
        </h2>
        <p className="mt-6 max-w-[550px] text-sm leading-7 text-[var(--text-main)]/62 sm:text-base">
          Extract dari sesi dan dokumen, consolidate ke struktur yang bersih,
          lalu recall kembali dengan signal yang bisa dipakai operator dan agent
          secara konsisten.
        </p>
      </div>
    </section>
  )
}

export default function Lander() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const focusRef = useRef<HTMLDivElement>(null)
  const [compactHeader, setCompactHeader] = useState(false)
  const [hideHeader, setHideHeader] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeCard, setActiveCard] = useState(0)
  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [focusVisible, setFocusVisible] = useState(reducedMotion)

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    let lastScrollTop = 0

    const onScroll = () => {
      const current = scroller.scrollTop
      const viewportHeight = scroller.clientHeight
      const delta = current - lastScrollTop

      setCompactHeader(current > viewportHeight * 0.25)

      if (current > viewportHeight) {
        if (delta > 12) setHideHeader(true)
        if (delta < -12) setHideHeader(false)
      } else {
        setHideHeader(false)
      }

      lastScrollTop = current
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const node = focusRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFocusVisible(true)
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  const scrollToTarget = (target: string) => {
    if (target === 'dashboard') return
    const node = document.getElementById(target)
    if (!node) return
    setMobileMenuOpen(false)
    node.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-main)]">
      <Navigation
        compactHeader={compactHeader}
        hideHeader={hideHeader}
        mobileMenuOpen={mobileMenuOpen}
        navItems={NAV_ITEMS}
        onToggleMenu={() => setMobileMenuOpen((value) => !value)}
        onScrollToTarget={scrollToTarget}
      />

      <div ref={scrollRef} className="h-screen overflow-y-auto overflow-x-hidden">
        <main className="min-h-screen bg-[var(--bg-canvas)]">
          <Hero />
          <EthosSection
            activeCard={activeCard}
            onActiveCardChange={setActiveCard}
          />
          <div ref={focusRef}>
            <FocusSection visible={focusVisible || reducedMotion} />
          </div>
          <CapabilitiesSection />
          <ShowcaseSection />
        </main>
      </div>
    </div>
  )
}
