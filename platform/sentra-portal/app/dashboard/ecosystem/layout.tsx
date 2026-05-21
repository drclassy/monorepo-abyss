import type { ReactNode } from 'react'

import Layout from '@/components/kokonutui/layout'

/** Legacy Kokonut ecosystem view keeps old shell. */
export default function EcosystemLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>
}
