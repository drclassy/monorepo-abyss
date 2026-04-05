'use client'

// Architected and built by Claudesy.

import { MenuVertical } from '@/components/ui/menu-vertical'
import type { ActiveZone } from '@/lib/types'

interface ZoneNavProps {
  activeZone: ActiveZone
  onZoneChange: (zone: ActiveZone) => void
  daemonRunning: boolean
}

const ZONES: { id: ActiveZone; label: string; sub: string }[] = [
  { id: 'overview', label: 'Overview', sub: 'Health'   },
  { id: 'memory',   label: 'Memory',   sub: 'Facts'    },
  { id: 'curation', label: 'Curation', sub: 'Curate'   },
]

export function ZoneNav({ activeZone, onZoneChange }: ZoneNavProps) {
  return (
    <nav className="zone-nav" aria-label="Zone navigation">
      <MenuVertical
        size="xl"
        menuItems={ZONES.map(({ id, label, sub }) => ({
          label,
          sub,
          active: activeZone === id,
          onClick: () => onZoneChange(id),
        }))}
      />


    </nav>
  )
}

export { ZoneNav as Sidebar }
