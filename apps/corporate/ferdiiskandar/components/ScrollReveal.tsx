'use client'

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { getRevealInitial } from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'

type ScrollRevealProps = {
  children: ReactNode
}

export default function ScrollReveal({ children }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  const isMotionReady = useMotionReady()
  const revealInitial = getRevealInitial(isMotionReady, shouldReduceMotion, { y: 28, opacity: 0 })
  const revealAnimate = isMotionReady && !shouldReduceMotion ? { y: 0, opacity: 1 } : undefined

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={revealInitial}
        transition={
          isMotionReady && !shouldReduceMotion
            ? { duration: 0.68, ease: [0.16, 1, 0.3, 1] }
            : undefined
        }
        viewport={{ once: true, amount: 0.18 }}
        whileInView={revealAnimate}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
