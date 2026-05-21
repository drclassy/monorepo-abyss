import * as React from 'react'

import { cn } from '../lib/cn'

export interface SentraCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'light' | 'glass'
}

export function SentraCard({ variant = 'dark', className, ...props }: SentraCardProps) {
  return <div className={cn('sentra-card', `sentra-card--${variant}`, className)} {...props} />
}
