import type { Transition, Variants } from 'framer-motion'

export const duration = {
  fast: 0.3,
  medium: 0.6,
  slow: 1.2,
  epic: 2.0,
} as const

export const ease = {
  entrance: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
  dramatic: [0.22, 1.61, 0.36, 1] as [number, number, number, number],
} as const

export const transitions: Record<string, Transition> = {
  fast: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  medium: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  slow: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  epic: { duration: 2.0, ease: [0.16, 1, 0.3, 1] },
  dramatic: { duration: 0.6, ease: [0.22, 1.61, 0.36, 1] },
}

export const motionVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  fadeDown: {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  slideIn: {
    hidden: { x: -60, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  slideInRight: {
    hidden: { x: 60, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  scaleReveal: {
    hidden: { scale: 0.92, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  blurIn: {
    hidden: { filter: 'blur(12px)', opacity: 0 },
    visible: { filter: 'blur(0px)', opacity: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
}

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

export const motionViewport = { once: true, amount: 0.15 } as const

export function getRevealInitial<T>(
  isMotionReady: boolean,
  shouldReduce: boolean | null,
  hiddenState: T,
): T | false {
  if (!isMotionReady || shouldReduce) {
    return false
  }

  return hiddenState
}
