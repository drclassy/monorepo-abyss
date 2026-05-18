import * as React from 'react'

import { sentraLogo } from '../../../design-token/src/logos'

export type SentraMarkTone = 'light' | 'dark' | 'current'

export interface SentraMarkProps extends Omit<React.SVGProps<SVGSVGElement>, 'color'> {
  tone?: SentraMarkTone
  title?: string
}

const toneFill: Record<SentraMarkTone, string> = {
  light: '#FDFDFD',
  dark: '#000000',
  current: 'currentColor',
}

export function SentraMark({
  tone = 'current',
  title = 'Sentra Artificial Intelligence',
  width = 40,
  height = 40,
  className,
  ...props
}: SentraMarkProps) {
  const titleId = React.useId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={sentraLogo.viewBox}
      width={width}
      height={height}
      role="img"
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d={sentraLogo.pathD} fill={toneFill[tone]} fillRule="evenodd" />
    </svg>
  )
}
