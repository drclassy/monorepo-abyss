'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { LazyMotion, domAnimation } from 'framer-motion'
import Link from 'next/link'

import { FadeIn } from '@/components/HeroMotion'
import { useMotionReady } from '@/lib/use-motion-ready'

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
              <p className="fi-hero-identity-tag">Perkenalan Publik</p>
              <p className="fi-hero-profile-intersection">Scientia ad societatem.</p>
              <h1 id="hero-title" className="fi-hero-headline">
                <span className="fi-hero-headline-line fi-enter-word fi-enter-word-1">
                  Human care,
                </span>
                <span className="fi-hero-headline-line fi-enter-word fi-enter-word-2">
                  augmented by
                </span>
                <span className="fi-hero-headline-line fi-hero-headline-line-accent fi-enter-word fi-enter-word-3">
                  intelligence.
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
                <p className="fi-hero-editorial-prose">
                  dr Ferdi Iskandar adalah dokter, CEO rumah sakit, dan pendiri Sentra Artificial
                  Intelligence. Ia membangun sistem AI dari pengalaman langsung mengelola layanan
                  kesehatan, memahami tekanan operasional, dan melihat bagaimana keputusan kecil
                  dapat memengaruhi keselamatan manusia.
                </p>
                <div className="fi-hero-cta-group">
                  <Link className="fi-hero-cta fi-hero-cta-primary" href="/works">
                    Buka Sistem Terpilih
                  </Link>
                  <Link className="fi-hero-cta fi-hero-cta-secondary" href="/#contact">
                    Mulai Percakapan
                  </Link>
                </div>
              </div>
            </div>
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
              <p
                className="fi-hero-editorial-prose fi-hero-signal-prose fi-enter-list-item"
                style={{ animationDelay: '0.58s' }}
              >
                Situs ini menjadi pintu masuk publik untuk memahami profil, karya, pemikiran, dan
                arah kolaborasi yang sedang dibangun—sebuah upaya merancang kecerdasan terapan yang
                membantu manusia bekerja lebih jernih, lebih aman, dan lebih bertanggung jawab.
              </p>
            </div>

            <Link aria-label="Menuju bagian dampak" className="fi-hero-orbit" href="/#impact">
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
                    Buka dossier • buka dossier •
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
