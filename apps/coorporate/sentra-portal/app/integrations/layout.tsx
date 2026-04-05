// Architected and built by Claudesy.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Nodes | Sentra Portal',
  description:
    'Manage your external service integrations - Vector databases, AI providers, storage, messaging, and monitoring services.',
}

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
