'use client'

interface CornerAccentProps {
  size?: number
  className?: string
  strokeColor?: string
  strokeWidth?: number
}

export function CornerAccent({
  size = 10,
  className = '',
  strokeColor = 'currentColor',
  strokeWidth = 0.6,
}: CornerAccentProps) {
  const path = `M${strokeWidth / 2} ${strokeWidth / 2}L${strokeWidth / 2} ${size - strokeWidth / 2}M${strokeWidth / 2} ${strokeWidth / 2}L${size - strokeWidth / 2} ${strokeWidth / 2}`

  return (
    <>
      {/* Top Left */}
      <svg
        className={`absolute top-0 left-0 pointer-events-none ${className}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <path d={path} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
      
      {/* Top Right */}
      <svg
        className={`absolute top-0 right-0 pointer-events-none ${className}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ transform: 'rotate(90deg)' }}
      >
        <path d={path} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
      
      {/* Bottom Right */}
      <svg
        className={`absolute bottom-0 right-0 pointer-events-none ${className}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ transform: 'rotate(180deg)' }}
      >
        <path d={path} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
      
      {/* Bottom Left */}
      <svg
        className={`absolute bottom-0 left-0 pointer-events-none ${className}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ transform: 'rotate(270deg)' }}
      >
        <path d={path} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    </>
  )
}
