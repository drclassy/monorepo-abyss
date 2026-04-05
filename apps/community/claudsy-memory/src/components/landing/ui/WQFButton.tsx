'use client'

import { useState } from 'react'
import { CornerAccent } from './CornerAccent'

interface WQFButtonProps {
  label: string
  href?: string
  theme?: 'light' | 'dark'
  onClick?: () => void
  className?: string
}

export function WQFButton({
  label,
  href,
  theme = 'dark',
  onClick,
  className = '',
}: WQFButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isLight = theme === 'light'
  const textColor = isLight ? 'text-rich-carbon' : 'text-off-white'
  const borderColor = isLight ? 'border-pulse-ash/30' : 'border-off-white/20'
  const dotColor = isLight ? 'bg-rich-carbon' : 'bg-off-white'

  const buttonContent = (
    <>
      <CornerAccent 
        size={10} 
        className={isLight ? 'text-rich-carbon/40' : 'text-off-white/30'}
        strokeColor="currentColor"
      />
      
      <div className="relative flex items-center gap-3 px-6 py-4 overflow-hidden">
        {/* Dot with slide animation */}
        <div
          className={`w-1.5 h-1.5 rounded-full ${dotColor} transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]`}
          style={{
            transform: isHovered ? 'translateX(0)' : 'translateX(-24px)',
          }}
        />
        
        {/* Text with slide animation */}
        <div className="relative overflow-hidden h-6">
          <span
            className={`block font-azeret-mono text-xs uppercase tracking-[0.08em] transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${textColor}`}
            style={{
              transform: isHovered ? 'translateY(-100%)' : 'translateY(0)',
            }}
          >
            {label}
          </span>
          <span
            className={`absolute top-0 left-0 block font-azeret-mono text-xs uppercase tracking-[0.08em] transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${textColor}`}
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </>
  )

  const containerClasses = `
    relative inline-flex items-center justify-center
    border ${borderColor}
    transition-colors duration-300
    ${isLight ? 'hover:border-rich-carbon/50' : 'hover:border-off-white/40'}
    ${className}
  `

  if (href) {
    return (
      <a
        href={href}
        className={containerClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {buttonContent}
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {buttonContent}
    </button>
  )
}
