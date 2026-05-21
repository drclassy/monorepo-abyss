export const sentraTypography = {
  family: {
    display: ['Space Grotesk', 'Inter', 'IBM Plex Sans', 'Arial', 'sans-serif'],
    body: ['Inter', 'IBM Plex Sans', 'Arial', 'sans-serif'],
    mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
  },
  size: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '44px',
    '5xl': '64px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  tracking: {
    normal: '0em',
    wide: '0.18em',
    tech: '0.28em',
  },
} as const
