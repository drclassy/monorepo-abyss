/**
 * PORTAL Sentra — Integrations In-Memory Store
 * Shared between API and server components. Replace with DB in production.
 * Architected and built by Claudesy.
 */

export interface Integration {
  id: string
  name: string
  type: 'vector-db' | 'ai-provider' | 'storage' | 'messaging' | 'monitoring'
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: string | null
  config: Record<string, string>
  description: string
  createdAt: string
  updatedAt: string
}

let integrations: Integration[] = [
  {
    id: '1',
    name: 'Pinecone Vector DB',
    type: 'vector-db',
    provider: 'Pinecone',
    status: 'connected',
    lastSync: new Date().toISOString(),
    config: { apiKey: '***', environment: 'us-east-1' },
    description: 'Vector database for semantic search and embeddings',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'OpenAI API',
    type: 'ai-provider',
    provider: 'OpenAI',
    status: 'connected',
    lastSync: new Date().toISOString(),
    config: { apiKey: '***', model: 'gpt-4' },
    description: 'AI provider for text generation and embeddings',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'AWS S3 Storage',
    type: 'storage',
    provider: 'AWS',
    status: 'connected',
    lastSync: new Date().toISOString(),
    config: { bucket: 'sentra-storage', region: 'us-west-2' },
    description: 'Object storage for documents and assets',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function getIntegrations(): Integration[] {
  return [...integrations]
}

export function setIntegrations(next: Integration[]): void {
  integrations = next
}

export function getIntegrationsCount(): number {
  return integrations.length
}

export function addIntegration(integration: Integration): void {
  integrations.push(integration)
}

export function findIntegrationById(id: string): Integration | undefined {
  return integrations.find(i => i.id === id)
}

export function updateIntegration(
  id: string,
  updates: Partial<Omit<Integration, 'id' | 'createdAt'>>
): Integration | undefined {
  const idx = integrations.findIndex(i => i.id === id)
  if (idx === -1) return undefined
  integrations[idx] = {
    ...integrations[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return integrations[idx]
}

export function deleteIntegration(id: string): Integration | undefined {
  const idx = integrations.findIndex(i => i.id === id)
  if (idx === -1) return undefined
  const deleted = integrations[idx]
  integrations = integrations.filter(i => i.id !== id)
  return deleted
}
