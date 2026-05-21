import { sentraColors } from './colors'
import { sentraRadius, sentraShadow } from './layout'
import { sentraTypography } from './typography'

export const sentraTailwindPreset = {
  theme: {
    extend: {
      colors: {
        sentra: {
          black: sentraColors.black,
          white: sentraColors.white,
          graphite: sentraColors.graphite,
          slate: sentraColors.slate,
          silver: sentraColors.silver,
          grid: sentraColors.grid,
          blue: sentraColors.blue,
          violet: sentraColors.violet,
          cyan: sentraColors.cyan,
          success: sentraColors.success,
          warning: sentraColors.warning,
          critical: sentraColors.critical,
        },
      },
      fontFamily: {
        display: sentraTypography.family.display,
        sans: sentraTypography.family.body,
        mono: sentraTypography.family.mono,
      },
      borderRadius: {
        sentraSm: sentraRadius.sm,
        sentraMd: sentraRadius.md,
        sentraLg: sentraRadius.lg,
        sentraXl: sentraRadius.xl,
        sentraPill: sentraRadius.pill,
      },
      boxShadow: {
        sentraSoft: sentraShadow.soft,
        sentraGlow: sentraShadow.glow,
        sentraPanel: sentraShadow.panel,
      },
      letterSpacing: {
        sentraWide: '0.18em',
        sentraTech: '0.28em',
      },
      backgroundImage: {
        'sentra-radial':
          'radial-gradient(circle at top right, rgba(0, 212, 255, 0.18), transparent 32%), linear-gradient(135deg, #000000 0%, #111318 55%, #0B1F3A 100%)',
      },
    },
  },
} as const

export default sentraTailwindPreset
