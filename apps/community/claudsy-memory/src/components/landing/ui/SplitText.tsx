'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SplitTextProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  delay?: number
  stagger?: number
  duration?: number
  yOffset?: number
}

export function SplitText({
  children,
  className = '',
  as: Component = 'span',
  delay = 0,
  stagger = 0.03,
  duration = 0.6,
  yOffset = 20,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion || !containerRef.current || hasAnimated.current) {
      if (containerRef.current) {
        const chars = containerRef.current.querySelectorAll('.split-char')
        chars.forEach(char => {
          (char as HTMLElement).style.opacity = '1'
          ;(char as HTMLElement).style.transform = 'translateY(0)'
        })
      }
      return
    }

    const chars = containerRef.current.querySelectorAll('.split-char')
    
    // Set initial state
    gsap.set(chars, {
      opacity: 0,
      y: yOffset,
    })

    // Create scroll trigger animation
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        hasAnimated.current = true
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: duration,
          stagger: stagger,
          delay: delay,
          ease: 'power2.out',
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [children, delay, stagger, duration, yOffset])

  // Split text into characters
  const characters = children.split('').map((char, index) => (
    <span
      key={index}
      className="split-char inline-block"
      style={{
        opacity: 0, // Initial state for SSR
        transform: `translateY(${yOffset}px)`,
        whiteSpace: char === ' ' ? 'pre' : 'normal',
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))

  return (
    <Component
      ref={containerRef as React.RefObject<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>}
      className={`inline-block ${className}`}
    >
      {characters}
    </Component>
  )
}
