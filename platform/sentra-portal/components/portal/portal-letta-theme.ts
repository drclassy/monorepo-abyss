import type { PortalV4Variant } from './portal-v4-theme'

/** Letta-style shell tokens; accent variants swap active nav + hero gradient. */
export const LETTA = {
  bg: '#0a0a0b',
  sidebar: '#111113',
  border: '#1f1f23',
  text: '#fafafa',
  muted: '#a1a1aa',
  cardCode: '#161618',
} as const

export function lettaAccent(variant: PortalV4Variant) {
  switch (variant) {
    case 'cyan':
      return {
        active: '#00D4FF',
        heroFrom: '#0c4a6e',
        heroTo: '#0369a1',
        glow: 'rgba(0,212,255,0.35)',
      }
    case 'violet':
      return {
        active: '#c084fc',
        heroFrom: '#4c1d95',
        heroTo: '#6d28d9',
        glow: 'rgba(192,132,252,0.35)',
      }
    case 'emerald':
      return {
        active: '#34d399',
        heroFrom: '#064e3b',
        heroTo: '#047857',
        glow: 'rgba(52,211,153,0.35)',
      }
    case 'red':
    default:
      return {
        active: '#e86a5a',
        heroFrom: '#1e3a8a',
        heroTo: '#1d4ed8',
        glow: 'rgba(59,130,246,0.4)',
      }
  }
}
