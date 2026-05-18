import * as React from 'react'

import { cn } from '../lib/cn'

import { SentraMark, type SentraMarkTone } from './SentraMark'

export interface SentraLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Extract<SentraMarkTone, 'light' | 'dark'>
  compact?: boolean
  markSize?: number
  wordmark?: string
  descriptor?: string
}

export function SentraLogo({
  tone = 'light',
  compact = false,
  markSize = 40,
  wordmark = 'Sentra',
  descriptor = 'Artificial Intelligence',
  className,
  ...props
}: SentraLogoProps) {
  return (
    <div
      className={cn('sentra-logo', tone === 'dark' && 'sentra-logo--dark', className)}
      {...props}
    >
      <SentraMark tone={tone} width={markSize} height={markSize} />
      {!compact ? (
        <div className="sentra-logo__wordmark" aria-label={`${wordmark} ${descriptor}`}>
          <span className="sentra-logo__name">{wordmark}</span>
          <span className="sentra-logo__descriptor">{descriptor}</span>
        </div>
      ) : null}
    </div>
  )
}
