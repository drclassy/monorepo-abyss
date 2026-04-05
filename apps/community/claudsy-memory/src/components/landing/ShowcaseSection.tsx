'use client'

import { useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Pagination } from 'swiper/modules'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Swiper as SwiperType } from 'swiper'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

import { WQFButton } from './ui/WQFButton'

gsap.registerPlugin(ScrollTrigger)

const AGENTS = [
  {
    id: 'claude',
    name: 'Claude',
    role: 'AI Assistant',
    description: 'Anthropic\'s thoughtful AI with persistent memory across conversations.',
    color: '#cf6b43',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="8" stroke="currentColor" strokeWidth="2"/>
        <circle cx="24" cy="20" r="6" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 34c0-4 4-8 8-8s8 4 8 8" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'codex',
    name: 'Codex',
    role: 'Code Intelligence',
    description: 'OpenAI\'s code generation model with repository-wide context awareness.',
    color: '#5c939f',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 48 48" fill="none">
        <path d="M14 16l-8 8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 16l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M26 8l-4 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'cursor',
    name: 'Cursor',
    role: 'Code Editor',
    description: 'AI-native IDE with deep codebase understanding and smart completions.',
    color: '#27ae60',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M14 20l6 4-6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="26" y1="28" x2="34" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'jules',
    name: 'Jules',
    role: 'Task Agent',
    description: 'Google\'s async coding agent that works independently on complex tasks.',
    color: '#df7a52',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 40c0-8 8-16 16-16s16 8 16 16" stroke="currentColor" strokeWidth="2"/>
        <circle cx="24" cy="12" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'copilot',
    name: 'Copilot',
    role: 'Pair Programmer',
    description: 'GitHub\'s AI pair programmer with context from your entire project.',
    color: '#a78bfa',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 48 48" fill="none">
        <path d="M24 4L6 14v20l18 10 18-10V14L24 4z" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 24l-8-4.5v9L24 33l8-4.5v-9L24 24z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
]

export function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const swiperRef = useRef<SwiperType | null>(null)

  // GSAP entrance animation
  useEffect(() => {
    const section = sectionRef.current
    const header = headerRef.current
    if (!section || !header) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    gsap.set(header, { opacity: 0, y: 40 })

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(header, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        })
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative overflow-hidden bg-[var(--bg-canvas)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div ref={headerRef} className="px-4 sm:px-6 lg:px-10 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p className="font-azeret-mono text-[11px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Integrated Agents
              </p>
              <h2 className="mt-4 font-roc-grotesk text-[clamp(2rem,5vw,4rem)] uppercase leading-[0.92] tracking-[-0.04em] text-[var(--text-main)] max-w-2xl">
                Your agents remember everything.
              </h2>
            </div>
            <WQFButton 
              label="Explore Capabilities" 
              href="#capabilities" 
              theme="dark"
            />
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className="relative">
          <Swiper
            modules={[Mousewheel, Pagination]}
            spaceBetween={24}
            slidesPerView="auto"
            centeredSlides={true}
            speed={500}
            slideToClickedSlide={true}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
            }}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !bg-white/30 !w-2 !h-2 !mx-1',
              bulletActiveClass: '!bg-[var(--c-asesmen)]',
            }}
            onSwiper={(swiper) => { swiperRef.current = swiper }}
            className="!pb-16"
            breakpoints={{
              320: {
                slidesPerView: 1.2,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2.2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 3.5,
                spaceBetween: 32,
              },
            }}
          >
            {AGENTS.map((agent) => (
              <SwiperSlide key={agent.id} className="!w-[280px] sm:!w-[320px] lg:!w-[360px]">
                {({ isActive }) => (
                  <div
                    className={`
                      group relative overflow-hidden p-8 transition-all duration-500 ease-[cubic-bezier(.62,.16,.13,1.01)]
                      ${isActive 
                        ? 'rounded-[20px] bg-[var(--bg-card)] opacity-100 scale-100' 
                        : 'rounded-none bg-transparent opacity-40 scale-95'}
                    `}
                    style={{
                      ['--agent-color' as string]: agent.color,
                    }}
                  >
                    {/* Hover glow effect */}
                    <div 
                      className={`
                        absolute inset-0 opacity-0 transition-opacity duration-500
                        ${isActive ? 'group-hover:opacity-100' : ''}
                      `}
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${agent.color}15 0%, transparent 70%)`,
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div 
                        className={`
                          mb-6 transition-colors duration-300
                          ${isActive ? 'text-[var(--agent-color)]' : 'text-[var(--text-muted)]'}
                        `}
                      >
                        {agent.icon}
                      </div>

                      {/* Name & Role */}
                      <h3 className="font-roc-grotesk text-2xl uppercase tracking-[-0.02em] text-[var(--text-main)] mb-1">
                        {agent.name}
                      </h3>
                      <p className="font-azeret-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">
                        {agent.role}
                      </p>

                      {/* Description - only visible when active */}
                      <div 
                        className={`
                          overflow-hidden transition-all duration-500
                          ${isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                        `}
                      >
                        <p className="text-sm leading-6 text-[var(--text-muted)]">
                          {agent.description}
                        </p>
                      </div>

                      {/* Corner accents when active */}
                      {isActive && (
                        <>
                          <div className="absolute top-4 left-4 w-2 h-2 border-l border-t border-[var(--agent-color)] opacity-50" />
                          <div className="absolute top-4 right-4 w-2 h-2 border-r border-t border-[var(--agent-color)] opacity-50" />
                          <div className="absolute bottom-4 left-4 w-2 h-2 border-l border-b border-[var(--agent-color)] opacity-50" />
                          <div className="absolute bottom-4 right-4 w-2 h-2 border-r border-b border-[var(--agent-color)] opacity-50" />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom navigation arrows */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-[var(--bg-canvas)]/80 backdrop-blur text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-white/20 transition-all"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-[var(--bg-canvas)]/80 backdrop-blur text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-white/20 transition-all"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
