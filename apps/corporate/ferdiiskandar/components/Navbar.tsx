'use client'

import { LazyMotion, domAnimation } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { FadeIn } from '@/components/HeroMotion'
import { primaryNav } from '@/lib/site-content'
import { useMotionReady } from '@/lib/use-motion-ready'

export default function Navbar() {
  const isMotionReady = useMotionReady()
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string) {
    if (href === '/#contact') return pathname === '/'
    return pathname === href
  }

  return (
    <LazyMotion features={domAnimation}>
      <header aria-label="Primary navigation" className="fi-nav fi-nav-modernized">
        <FadeIn
          as="div"
          delay={0.06}
          distance={14}
          duration={0.82}
          motionReady={isMotionReady}
          y={-14}
        >
          <div className="fi-shell fi-nav-editorial-shell">
            <Link aria-label="Back to homepage" className="fi-nav-editorial-mark" href="/">
              <span>FI</span>
            </Link>

            <div className="fi-nav-editorial-stack">
              <div className="fi-nav-editorial-edition">Current issue / Founder dossier 2026</div>

              <nav aria-label="Primary navigation" className="fi-nav-editorial-links">
                {primaryNav.map((item) => (
                  <Link
                    className={[
                      'fi-nav-editorial-link',
                      isActive(item.href) ? 'is-active' : '',
                      item.label === 'Contact' ? 'is-contact' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    href={item.href}
                    key={item.label}
                    onClick={() => {
                      if (!item.href.startsWith('/#')) return
                      router.push(item.href)
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </FadeIn>
      </header>
    </LazyMotion>
  )
}
