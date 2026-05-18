import * as React from 'react'

import { cn } from '../lib/cn'

export interface SentraPanelProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string
  title: string
  description?: string
}

export function SentraPanel({
  eyebrow,
  title,
  description,
  className,
  children,
  ...props
}: SentraPanelProps) {
  return (
    <section className={cn('sentra-panel', className)} {...props}>
      <div className="sentra-panel__header">
        {eyebrow ? <p className="sentra-panel__eyebrow">{eyebrow}</p> : null}
        <h2 className="sentra-panel__title">{title}</h2>
        {description ? <p className="sentra-panel__description">{description}</p> : null}
      </div>
      {children ? <div className="sentra-panel__content">{children}</div> : null}
    </section>
  )
}
