import type { ReactNode } from 'react'

import { NewspaperProvider } from '@/components/portal/newspaper/newspaper-provider'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <NewspaperProvider>
      <div className="h-screen overflow-hidden">{children}</div>
    </NewspaperProvider>
  )
}
