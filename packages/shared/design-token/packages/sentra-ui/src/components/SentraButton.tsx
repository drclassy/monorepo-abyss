import * as React from 'react'

import { cn } from '../lib/cn'

export interface SentraButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function SentraButton({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: SentraButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'sentra-button',
        `sentra-button--${variant}`,
        `sentra-button--${size}`,
        className
      )}
      {...props}
    />
  )
}
