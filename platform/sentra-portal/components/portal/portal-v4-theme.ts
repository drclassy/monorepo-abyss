export type PortalV4Variant = 'red' | 'cyan' | 'violet' | 'emerald'

export const PORTAL_V4_VARIANTS: Array<{
  id: PortalV4Variant
  label: string
  accent: string
}> = [
  { id: 'red', label: 'Signal', accent: '#EE2737' },
  { id: 'cyan', label: 'Sentra', accent: '#00D4FF' },
  { id: 'violet', label: 'Pulse', accent: '#A855F7' },
  { id: 'emerald', label: 'Clinical', accent: '#10B981' },
]

export const PORTAL_V4_STORAGE_KEY = 'portal-v4-accent'

export function getPortalV4Accent(variant: PortalV4Variant): string {
  return PORTAL_V4_VARIANTS.find((v) => v.id === variant)?.accent ?? '#EE2737'
}
