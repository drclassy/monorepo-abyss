// Claudesy Transformer Engine V2 — Scramble Text Animation
'use client'

import { useState, useEffect } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'

interface ScrambleTextProps {
  text: string
  className?: string
  speed?: number
  loop?: boolean
}

export function ScrambleText({ text, className, speed = 30, loop = false }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    let settled = 0
    setDisplay(text)

    const interval = setInterval(() => {
      if (!loop && settled >= text.length) {
        clearInterval(interval)
        return
      }

      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (!loop && i < settled) return char
            if (char === ' ') return ' '
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )
      if (!loop) settled += 1
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, loop])

  return <span className={className}>{display}</span>
}
