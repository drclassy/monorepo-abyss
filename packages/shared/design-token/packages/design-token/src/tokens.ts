export const sentraTokens = {
  brand: {
    name: 'Sentra Artificial Intelligence',
    shortName: 'Sentra AI',
    version: '2026',
    assetKitVersion: '1.0.0',
    description:
      'Monochrome-first enterprise AI identity with restrained cyan and violet digital accents.',
    positioning: 'Enterprise AI system built for clarity, trust, and intelligent execution.',
  },
  color: {
    primitive: {
      black: {
        value: '#000000',
        rgb: '0, 0, 0',
        cmyk: '0, 0, 0, 100',
      },
      white: {
        value: '#FDFDFD',
        rgb: '253, 253, 253',
        cmyk: '0, 0, 0, 1',
      },
      graphite: {
        value: '#111318',
        rgb: '17, 19, 24',
        cmyk: '29, 21, 0, 91',
      },
      slate: {
        value: '#2B2F38',
        rgb: '43, 47, 56',
        cmyk: '23, 16, 0, 78',
      },
      silver: {
        value: '#A0A0A2',
        rgb: '160, 160, 162',
        cmyk: '1, 1, 0, 36',
      },
      grid: {
        value: '#E8EAF0',
        rgb: '232, 234, 240',
        cmyk: '3, 2, 0, 6',
      },
      blue: {
        value: '#0B1F3A',
        rgb: '11, 31, 58',
        cmyk: '81, 47, 0, 77',
      },
      violet: {
        value: '#6D5DFC',
        rgb: '109, 93, 252',
        cmyk: '57, 63, 0, 1',
      },
      cyan: {
        value: '#00D4FF',
        rgb: '0, 212, 255',
        cmyk: '100, 17, 0, 0',
      },
      success: {
        value: '#12B981',
        rgb: '18, 185, 129',
        cmyk: '90, 0, 30, 27',
      },
      warning: {
        value: '#F59E0B',
        rgb: '245, 158, 11',
        cmyk: '0, 36, 96, 4',
      },
      critical: {
        value: '#EF4444',
        rgb: '239, 68, 68',
        cmyk: '0, 72, 72, 6',
      },
    },
    semantic: {
      background: {
        canvas: '#000000',
        surface: '#111318',
        elevated: '#171A21',
        muted: '#2B2F38',
      },
      foreground: {
        primary: '#FDFDFD',
        secondary: '#A0A0A2',
        inverse: '#000000',
        muted: '#E8EAF0',
      },
      border: {
        default: '#2B2F38',
        subtle: 'rgba(255,255,255,0.08)',
        active: '#00D4FF',
      },
      accent: {
        primary: '#00D4FF',
        secondary: '#6D5DFC',
        enterprise: '#0B1F3A',
      },
      status: {
        success: '#12B981',
        warning: '#F59E0B',
        critical: '#EF4444',
      },
    },
  },
  typography: {
    family: {
      display: 'Space Grotesk, Inter, IBM Plex Sans, Arial, sans-serif',
      body: 'Inter, IBM Plex Sans, Arial, sans-serif',
      mono: 'JetBrains Mono, SFMono-Regular, Consolas, monospace',
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
  },
  space: {
    '0': '0px',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
    '20': '80px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    pill: '999px',
  },
  shadow: {
    soft: '0 20px 50px rgba(0,0,0,0.28)',
    glow: '0 0 32px rgba(0,212,255,0.18)',
    panel: '0 18px 60px rgba(0,0,0,0.35)',
  },
  logo: {
    viewBox: '0 0 933 933',
    clearSpace:
      'Minimum 1X from the primary stroke thickness; use 1.5X-2X for corporate placements.',
    minimumSize: {
      websiteHeader: '32px',
      mobileHeader: '28px',
      favicon: '16px',
      printDocument: '18mm',
      businessCard: '12mm',
      slideDeck: '40px',
    },
    rules: [
      'Do not stretch, rotate, skew, recolor randomly, or add heavy effects.',
      'Use white logo on black/graphite backgrounds and black logo on white/light backgrounds.',
      'Avoid busy photography or low-contrast surfaces.',
    ],
  },
  motion: {
    duration: {
      fast: '120ms',
      base: '180ms',
      slow: '260ms',
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
      emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },
} as const

export type SentraTokens = typeof sentraTokens
