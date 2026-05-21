export const sentraColors = {
  black: '#000000',
  white: '#FDFDFD',
  graphite: '#111318',
  slate: '#2B2F38',
  silver: '#A0A0A2',
  grid: '#E8EAF0',
  blue: '#0B1F3A',
  violet: '#6D5DFC',
  cyan: '#00D4FF',
  success: '#12B981',
  warning: '#F59E0B',
  critical: '#EF4444',
} as const

export const sentraSemanticColors = {
  background: {
    canvas: sentraColors.black,
    surface: sentraColors.graphite,
    elevated: '#171A21',
    muted: sentraColors.slate,
  },
  foreground: {
    primary: sentraColors.white,
    secondary: sentraColors.silver,
    inverse: sentraColors.black,
    muted: sentraColors.grid,
  },
  border: {
    default: sentraColors.slate,
    subtle: 'rgba(255,255,255,0.08)',
    active: sentraColors.cyan,
  },
  accent: {
    primary: sentraColors.cyan,
    secondary: sentraColors.violet,
    enterprise: sentraColors.blue,
  },
  status: {
    success: sentraColors.success,
    warning: sentraColors.warning,
    critical: sentraColors.critical,
  },
} as const
