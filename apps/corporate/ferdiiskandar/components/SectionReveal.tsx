'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { Transition } from 'framer-motion'

import { getRevealInitial, motionVariants, motionViewport } from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'

interface Props {
  children: React.ReactNode
  className?: string
  variant?: keyof typeof motionVariants
  delay?: number
  customTransition?: Transition
}

export default function SectionReveal({
  children,
  className,
  variant = 'fadeUp',
  delay = 0,
  customTransition,
}: Props) {
  const shouldReduce = useReducedMotion()
  const isMotionReady = useMotionReady()

  if (shouldReduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={getRevealInitial(isMotionReady, shouldReduce, 'hidden')}
      whileInView="visible"
      viewport={motionViewport}
      variants={motionVariants[variant]}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay, ...customTransition }}
    >
      {children}
    </motion.div>
  )
}
