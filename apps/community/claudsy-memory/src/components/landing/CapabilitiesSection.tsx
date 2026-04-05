'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CAPABILITIES = [
  {
    id: 'extract',
    title: 'Extract',
    description: 'Automatically extract facts, entities, and relationships from every agent session. Transform raw conversations into structured, queryable memory.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    id: 'consolidate',
    title: 'Consolidate',
    description: 'Merge fragmented memories into coherent knowledge graphs. Remove duplicates, resolve conflicts, and build persistent semantic networks.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 4v16M4 12h16M6 6l12 12M18 6L6 18" />
      </svg>
    ),
  },
  {
    id: 'health-monitor',
    title: 'Health Monitor',
    description: 'Continuous diagnostics across memory stores. Detect corruption, measure coherence, and alert on anomalies before they impact agent performance.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: 'search-recall',
    title: 'Search & Recall',
    description: 'Retrieve relevant context with semantic similarity. Vector search across episodic and declarative memory with sub-second latency.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'curation',
    title: 'Curation',
    description: 'Human-in-the-loop memory refinement. Review, edit, and approve extracted facts before they enter long-term storage.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'boot-context',
    title: 'Boot Context',
    description: 'Inject relevant memory into new sessions. Agents start with full context awareness, eliminating cold starts and repetitive explanations.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
]

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [activeLink, setActiveLink] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // GSAP entrance animation
  useEffect(() => {
    const section = sectionRef.current
    const list = listRef.current
    if (!section || !list) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const items = list.querySelectorAll('.capability-item')
    
    gsap.set(items, { opacity: 0, y: 80 })

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        })
      },
    })

    return () => trigger.kill()
  }, [])

  const activeCapability = CAPABILITIES.find(c => c.id === activeLink)

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="relative min-h-dvh bg-[var(--bg-canvas)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <p className="font-azeret-mono text-[11px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Capabilities
          </p>
          <h2 className="mt-4 font-roc-grotesk text-[clamp(2rem,5vw,4rem)] uppercase leading-[0.92] tracking-[-0.04em] text-[var(--text-main)]">
            Everything your agents need to remember.
          </h2>
        </div>

        {/* Desktop: Side by side / Mobile: Accordion */}
        <div className="flex flex-col lg:flex-row lg:gap-16">
          {/* Capabilities List */}
          <div ref={listRef} className="flex-1">
            {CAPABILITIES.map((capability) => (
              <div
                key={capability.id}
                className="capability-item border-t border-white/10 last:border-b"
                data-active={activeLink === capability.id}
              >
                <button
                  className="group w-full py-6 text-left transition-colors"
                  onMouseEnter={() => !isMobile && setActiveLink(capability.id)}
                  onMouseLeave={() => !isMobile && setActiveLink(null)}
                  onClick={() => isMobile && setActiveLink(activeLink === capability.id ? null : capability.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`
                      font-roc-grotesk text-[clamp(1.5rem,4vw,3rem)] uppercase tracking-[-0.02em] transition-all duration-400
                      ${activeLink === capability.id 
                        ? 'text-[var(--text-main)]' 
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}
                    `}>
                      {capability.title}
                    </h3>
                    
                    {/* Mobile arrow indicator */}
                    <svg 
                      className={`
                        w-6 h-6 lg:hidden transition-transform duration-300
                        ${activeLink === capability.id ? 'rotate-180' : ''}
                      `}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Mobile: Accordion content */}
                  {isMobile && (
                    <div className={`
                      overflow-hidden transition-all duration-400
                      ${activeLink === capability.id ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}
                    `}>
                      <p className="text-sm leading-7 text-[var(--text-muted)]">
                        {capability.description}
                      </p>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop: Reveal Panel */}
          <div className="hidden lg:block lg:w-[400px] xl:w-[480px]">
            <div className="sticky top-32 min-h-[400px]">
              {activeCapability ? (
                <div className="rounded-[20px] border border-white/10 bg-[var(--bg-card)] p-8 transition-all duration-400">
                  <div className="mb-6 text-[var(--c-asesmen)]">
                    {activeCapability.icon}
                  </div>
                  <h4 className="font-roc-grotesk text-2xl uppercase tracking-[-0.02em] text-[var(--text-main)] mb-4">
                    {activeCapability.title}
                  </h4>
                  <p className="text-base leading-7 text-[var(--text-muted)]">
                    {activeCapability.description}
                  </p>
                </div>
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center rounded-[20px] border border-white/5 border-dashed">
                  <p className="font-azeret-mono text-xs uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    Hover to explore
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
