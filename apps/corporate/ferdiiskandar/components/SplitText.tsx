'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { getRevealInitial, motionViewport } from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'

interface Props {
  text: string
  mode?: 'word' | 'char'
  stagger?: number
  delay?: number
  className?: string
  unitClassName?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

const itemVariant = {
  hidden: { y: 32, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

export default function SplitText({
  text,
  mode = 'word',
  stagger = 0.05,
  delay = 0.1,
  className,
  unitClassName,
  as: Tag = 'span',
}: Props) {
  const shouldReduce = useReducedMotion()
  const isMotionReady = useMotionReady()

  const units = mode === 'word' ? text.split(' ') : text.split('')
  const motionTagMap = {
    h1: motion.h1,
    h2: motion.h2,
    h3: motion.h3,
    p: motion.p,
    span: motion.span,
  }
  const MotionTag = motionTagMap[Tag]

  const containerVariant = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : stagger,
        delayChildren: shouldReduce ? 0 : delay,
      },
    },
  }

  return (
    <MotionTag
      className={className}
      initial={getRevealInitial(isMotionReady, shouldReduce, 'hidden')}
      whileInView="visible"
      viewport={motionViewport}
      variants={containerVariant}
      aria-label={text}
    >
      {units.map((unit, i) => (
        <motion.span
          key={i}
          variants={itemVariant}
          className={unitClassName}
          style={{ display: 'inline-block' }}
          aria-hidden="true"
        >
          {unit}
          {mode === 'word' && i < units.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </MotionTag>
  )
}
