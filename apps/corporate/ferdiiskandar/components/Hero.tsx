'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { LazyMotion, domAnimation } from 'framer-motion'
import Link from 'next/link'

import { FadeIn } from '@/components/HeroMotion'
import { useMotionReady } from '@/lib/use-motion-ready'

const conceptLines = [
  'Clinical Trajectory',
  'Neuro-Symbolic Reasoning',
  'Clinical Metacognition',
  'Preventive Healthcare Intelligence',
  'AI-Native Hospital Systems',
] as const

const heroSignals = [
  {
    label: 'Primary lens',
    value: 'Preventive healthcare intelligence',
  },
  {
    label: 'Operating mode',
    value: 'Founder-led system architecture',
  },
  {
    label: 'Public outcome',
    value: 'Clearer decisions and calmer care',
  },
] as const

export default function Hero() {
  const isMotionReady = useMotionReady()

  return (
    <LazyMotion features={domAnimation}>
      <section aria-labelledby="hero-title" className="fi-hero fi-home-dossier-hero fi-hero-clean">
        <div className="fi-hero-editorial">
          <FadeIn
            as="div"
            className="fi-hero-editorial-row fi-hero-editorial-row-intro"
            delay={0.08}
            distance={16}
            duration={0.6}
            motionReady={isMotionReady}
          >
            <div className="fi-hero-headline-group">
              <p className="fi-hero-identity-tag">
                Physician · 12-Year Hospital CEO · Founder of Sentra Artificial Intelligence
              </p>
              <h1 id="hero-title" className="fi-hero-headline">
                <span className="fi-hero-headline-line fi-enter-word fi-enter-word-1">
                  dr Ferdi
                </span>
                <span className="fi-hero-headline-line fi-enter-word fi-enter-word-2">
                  Iskandar
                </span>
                <span className="fi-hero-headline-line fi-hero-headline-line-accent fi-enter-word fi-enter-word-3">
                  Human—AI
                </span>
                <span className="fi-hero-headline-line fi-enter-word fi-enter-word-4">
                  Architect
                </span>
              </h1>
            </div>
            <div className="fi-hero-editorial-rail">
              <DotLottieReact
                autoplay
                className="fi-hero-lottie"
                layout={{ fit: 'contain', align: [0.5, 0.5] }}
                loop
                renderConfig={{ autoResize: true }}
                src="/hero.lottie"
              />
              <div className="fi-hero-editorial-copy">
                <p className="fi-hero-editorial-note fi-hero-editorial-note-primary">
                  I build human-centered AI systems for healthcare, where clinical reasoning,
                  preventive intelligence, and lived hospital leadership operate as one surface.
                </p>
                <div className="fi-hero-cta-group">
                  <Link className="fi-hero-cta fi-hero-cta-primary" href="/works">
                    Open Selected Systems
                  </Link>
                  <Link className="fi-hero-cta fi-hero-cta-secondary" href="/#contact">
                    Start a Conversation
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn
            as="div"
            className="fi-hero-editorial-row fi-hero-editorial-row-capability"
            delay={0.18}
            distance={18}
            duration={0.62}
            motionReady={isMotionReady}
          >
            <p className="fi-hero-quote fi-enter-list-item" style={{ animationDelay: '0.42s' }}>
              The future of healthcare is not only to treat disease — but to understand where a
              patient is heading before deterioration becomes critical.
            </p>
          </FadeIn>

          <FadeIn
            as="div"
            className="fi-hero-editorial-row fi-hero-editorial-row-signal"
            delay={0.28}
            distance={20}
            duration={0.62}
            motionReady={isMotionReady}
          >
            <div className="fi-hero-signal-ledger">
              <p className="fi-hero-signal-ledger-label">Current operating fields</p>
              <div className="fi-hero-concept-strip">
                <ul>
                  {conceptLines.map((line, index) => (
                    <li
                      key={line}
                      className="fi-enter-list-item"
                      style={{ animationDelay: `${0.58 + index * 0.06}s` }}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="fi-hero-signal-list">
                {heroSignals.map((signal, index) => (
                  <li
                    key={signal.label}
                    className="fi-enter-list-item"
                    style={{ animationDelay: `${0.88 + index * 0.08}s` }}
                  >
                    <span>{signal.label}</span>
                    <strong>{signal.value}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <Link aria-label="Jump to impact section" className="fi-hero-orbit" href="/#impact">
              <svg className="fi-hero-orbit-svg" fill="none" viewBox="0 0 120 120">
                <defs>
                  <path
                    d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                    id="fi-hero-orbit-path"
                  />
                </defs>
                <circle cx="60" cy="60" r="36" stroke="currentColor" strokeOpacity="0.35" />
                <circle cx="60" cy="60" r="4" fill="currentColor" />
                <text>
                  <textPath href="#fi-hero-orbit-path" startOffset="0%">
                    Enter dossier • enter dossier •
                  </textPath>
                </text>
              </svg>
            </Link>
          </FadeIn>
        </div>
      </section>
    </LazyMotion>
  )
}
