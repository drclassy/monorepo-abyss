'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import * as React from 'react'

import { getRevealInitial } from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'
import { cn } from '@/lib/utils'

export interface IconGridItem {
  id: string
  icon: React.ReactNode
  name: string
  description?: string
  href?: string
}

export interface IconGridProps {
  items: IconGridItem[]
  className?: string
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
  },
}

const IconGrid = React.forwardRef<HTMLDivElement, IconGridProps>(({ items, className }, ref) => {
  const isMotionReady = useMotionReady()

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial={getRevealInitial(isMotionReady, false, 'hidden')}
      animate="visible"
      className={cn('fi-icon-grid', className)}
    >
      {items.map((item) => {
        const Tag = item.href ? motion.a : motion.div
        const linkProps = item.href
          ? { href: item.href, target: '_blank', rel: 'noreferrer noopener' }
          : {}

        return (
          <Tag
            key={item.id}
            variants={itemVariants}
            className="fi-icon-card"
            aria-label={item.name}
            {...(linkProps as object)}
          >
            <div className="fi-icon-card-mark">{item.icon}</div>
            <strong className="fi-icon-card-name">{item.name}</strong>
            {item.description && <span className="fi-icon-card-desc">{item.description}</span>}
          </Tag>
        )
      })}
    </motion.div>
  )
})

IconGrid.displayName = 'IconGrid'

export { IconGrid }
