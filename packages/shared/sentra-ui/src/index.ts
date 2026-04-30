// @the-abyss/ui - Public API

/** `clsx` + `tailwind-merge` utility for conditional class name composition. */
export { cn } from './lib/utils'

/** Radix-based UI primitives styled with Tailwind CSS v4. */
export * from './components/ui/button'
export * from './components/ui/card'
export * from './components/ui/input'
export * from './components/ui/label'
export * from './components/ui/badge'

/** Headless Radix UI primitives — use these directly when the styled variants are insufficient. */
export * from '@radix-ui/react-slot'
export * from '@radix-ui/react-dialog'
export * from '@radix-ui/react-dropdown-menu'
export * from '@radix-ui/react-label'

/** Full Lucide icon set — import individual icons to keep bundle size small. */
export * from 'lucide-react'
