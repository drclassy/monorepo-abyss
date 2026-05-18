import * as React from 'react'

import { cn } from '../lib/cn'

export interface SentraBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'cyan' | 'violet' | 'success' | 'warning' | 'critical'
}

export function SentraBadge({ tone = 'neutral', className, ...props }: SentraBadgeProps) {
  return <span className={cn('sentra-badge', `sentra-badge--${tone}`, className)} {...props} />
}
