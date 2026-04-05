// Architected and built by Claudesy.

'use client'

import {
  Activity,
  AlertCircle,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  Database,
  Filter,
  MessageSquare,
  MoreVertical,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Types
interface Integration {
  id: string
  name: string
  type: 'vector-db' | 'ai-provider' | 'storage' | 'messaging' | 'monitoring'
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync: string | null
  config: Record<string, string>
  description: string
  createdAt?: string
  updatedAt?: string
}

interface ConnectionLog {
  id: string
  integrationId: string
  action: string
  status: 'success' | 'error' | 'warning'
  timestamp: string
  message: string
}

// Fallback when API fails
const FALLBACK_INTEGRATIONS: Integration[] = []

const mockLogs: ConnectionLog[] = [
  {
    id: '1',
    integrationId: '1',
    action: 'Sync',
    status: 'success',
    timestamp: '2 min ago',
    message: 'Vectors synchronized successfully',
  },
  {
    id: '2',
    integrationId: '2',
    action: 'API Call',
    status: 'success',
    timestamp: '5 min ago',
    message: 'Embedding generation completed',
  },
  {
    id: '3',
    integrationId: '5',
    action: 'Health Check',
    status: 'error',
    timestamp: '1 hour ago',
    message: 'Connection timeout after 30s',
  },
  {
    id: '4',
    integrationId: '3',
    action: 'Upload',
    status: 'success',
    timestamp: '2 hours ago',
    message: 'Batch upload: 156 files',
  },
  {
    id: '5',
    integrationId: '6',
    action: 'Test',
    status: 'success',
    timestamp: '3 hours ago',
    message: 'Connection test passed',
  },
]

function formatLastSync(iso: string | null): string | null {
  if (!iso) return null
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString()
  } catch {
    return iso
  }
}

// Icon mapping
const getIcon = (type: Integration['type']) => {
  switch (type) {
    case 'vector-db':
      return Database
    case 'ai-provider':
      return Zap
    case 'storage':
      return Cloud
    case 'messaging':
      return MessageSquare
    case 'monitoring':
      return Activity
    default:
      return Box
  }
}

const getStatusIcon = (status: Integration['status']) => {
  switch (status) {
    case 'connected':
      return CheckCircle2
    case 'disconnected':
      return XCircle
    case 'error':
      return AlertCircle
    case 'syncing':
      return RefreshCw
    default:
      return Box
  }
}

const getStatusColor = (status: Integration['status']) => {
  switch (status) {
    case 'connected':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    case 'disconnected':
      return 'text-sentra-text-secondary bg-sentra-text-secondary/10 border-sentra-text-secondary/20'
    case 'error':
      return 'text-red-400 bg-red-400/10 border-red-400/20'
    case 'syncing':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    default:
      return 'text-sentra-text-secondary bg-sentra-text-secondary/10'
  }
}

const getTypeLabel = (type: Integration['type']) => {
  switch (type) {
    case 'vector-db':
      return 'Vector Database'
    case 'ai-provider':
      return 'AI Provider'
    case 'storage':
      return 'Storage'
    case 'messaging':
      return 'Messaging'
    case 'monitoring':
      return 'Monitoring'
    default:
      return type
  }
}

// Components
function StatusBadge({ status }: { status: Integration['status'] }) {
  const Icon = getStatusIcon(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        getStatusColor(status)
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', status === 'syncing' && 'animate-spin')} />
      <span className="capitalize">{status}</span>
    </span>
  )
}

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onConfigure,
  onTest,
  onDelete,
}: {
  integration: Integration
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
  onConfigure: (integration: Integration) => void
  onTest: (id: string) => void
  onDelete: (id: string) => void
}) {
  const Icon = getIcon(integration.type)
  const StatusIcon = getStatusIcon(integration.status)

  return (
    <div className="group relative bg-surface-secondary border border-sentra-border-medium rounded-xl p-5 hover:border-sentra-border-strong transition-all duration-200 hover:shadow-lg hover:shadow-surface-primary/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-tertiary flex items-center justify-center">
            <Icon className="w-5 h-5 text-sentra-text-primary" />
          </div>
          <div>
            <h3 className="text-sentra-text-primary font-medium text-sm">{integration.name}</h3>
            <p className="text-sentra-text-muted text-xs">{getTypeLabel(integration.type)}</p>
          </div>
        </div>
        <StatusBadge status={integration.status} />
      </div>

      <p className="text-sentra-text-secondary text-sm mb-4 line-clamp-2">
        {integration.description}
      </p>

      <div className="flex items-center gap-2 text-xs text-sentra-text-muted mb-4">
        <Clock className="w-3.5 h-3.5" />
        <span>{formatLastSync(integration.lastSync) || 'Never synced'}</span>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-sentra-border-medium">
        {integration.status === 'connected' || integration.status === 'syncing' ? (
          <>
            <button
              onClick={() => onTest(integration.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary text-xs font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Test
            </button>
            <button
              onClick={() => onConfigure(integration)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary text-xs font-medium rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Configure
            </button>
            <button
              onClick={() => onDisconnect(integration.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-tertiary hover:bg-red-900/30 hover:text-red-400 text-sentra-text-primary text-xs font-medium rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onConnect(integration.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plug className="w-3.5 h-3.5" />
              Connect
            </button>
            <button
              onClick={() => onConfigure(integration)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary text-xs font-medium rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Configure
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(integration.id)}
          className="p-2 text-sentra-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AddIntegrationModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (integration: Omit<Integration, 'id' | 'status' | 'lastSync'>) => void
}) {
  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [selectedType, setSelectedType] = useState<Integration['type'] | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    description: '',
    config: {} as Record<string, string>,
  })

  const integrationTypes: {
    type: Integration['type']
    label: string
    icon: typeof Database
    providers: string[]
  }[] = [
    {
      type: 'vector-db',
      label: 'Vector Database',
      icon: Database,
      providers: ['Pinecone', 'Weaviate', 'Chroma', 'Milvus'],
    },
    {
      type: 'ai-provider',
      label: 'AI Provider',
      icon: Zap,
      providers: ['OpenAI', 'Anthropic', 'Google Gemini', 'Cohere'],
    },
    {
      type: 'storage',
      label: 'Storage',
      icon: Cloud,
      providers: ['AWS S3', 'Google Cloud Storage', 'Azure Blob', 'MinIO'],
    },
    {
      type: 'messaging',
      label: 'Messaging',
      icon: MessageSquare,
      providers: ['Slack', 'Discord', 'Teams', 'Telegram'],
    },
    {
      type: 'monitoring',
      label: 'Monitoring',
      icon: Activity,
      providers: ['Sentry', 'DataDog', 'Grafana', 'New Relic'],
    },
  ]

  const handleTypeSelect = (type: Integration['type']) => {
    setSelectedType(type)
    setStep('configure')
    const typeInfo = integrationTypes.find(t => t.type === type)
    if (typeInfo) {
      setFormData(prev => ({
        ...prev,
        type,
        provider: typeInfo.providers[0],
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedType) {
      onAdd({
        ...formData,
        type: selectedType,
      })
      setStep('select')
      setSelectedType(null)
      setFormData({ name: '', provider: '', description: '', config: {} })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-page/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-secondary border border-sentra-border-medium rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sentra-border-medium">
          <h2 className="text-lg font-semibold text-sentra-text-primary">
            {step === 'select' ? 'Add Integration' : 'Configure Integration'}
          </h2>
          <button
            onClick={() => {
              setStep('select')
              setSelectedType(null)
              onClose()
            }}
            className="text-sentra-text-muted hover:text-sentra-text-primary transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'select' ? (
            <div className="grid grid-cols-2 gap-3">
              {integrationTypes.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="flex flex-col items-center gap-3 p-4 bg-surface-tertiary/50 hover:bg-surface-tertiary border border-sentra-border-medium hover:border-sentra-border-strong rounded-xl transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-tertiary group-hover:bg-surface-hover flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6 text-sentra-text-primary group-hover:text-sentra-text-primary" />
                  </div>
                  <span className="text-sm font-medium text-sentra-text-primary group-hover:text-sentra-text-primary">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sentra-text-secondary mb-1.5">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production Pinecone"
                  className="w-full px-3 py-2 bg-surface-tertiary border border-sentra-border-strong rounded-lg text-sentra-text-primary placeholder:text-sentra-text-muted focus:outline-none focus:ring-2 focus:ring-sentra-border-strong focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sentra-text-secondary mb-1.5">
                  Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      provider: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-surface-tertiary border border-sentra-border-strong rounded-lg text-sentra-text-primary focus:outline-none focus:ring-2 focus:ring-sentra-border-strong focus:border-transparent"
                >
                  {integrationTypes
                    .find(t => t.type === selectedType)
                    ?.providers.map(provider => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sentra-text-secondary mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this integration..."
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-tertiary border border-sentra-border-strong rounded-lg text-sentra-text-primary placeholder:text-sentra-text-muted focus:outline-none focus:ring-2 focus:ring-sentra-border-strong focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sentra-text-secondary mb-1.5">
                  API Key / Token
                </label>
                <input
                  type="password"
                  placeholder="Enter your API key..."
                  className="w-full px-3 py-2 bg-surface-tertiary border border-sentra-border-strong rounded-lg text-sentra-text-primary placeholder:text-sentra-text-muted focus:outline-none focus:ring-2 focus:ring-sentra-border-strong focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 px-4 py-2.5 bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary font-medium rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
                >
                  Add Integration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfigureModal({
  integration,
  isOpen,
  onClose,
  onSave,
}: {
  integration: Integration | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, config: Record<string, string>) => void
}) {
  const [config, setConfig] = useState<Record<string, string>>({})

  useEffect(() => {
    if (integration) {
      setConfig(integration.config)
    }
  }, [integration])

  if (!isOpen || !integration) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-page/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-secondary border border-sentra-border-medium rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sentra-border-medium">
          <h2 className="text-lg font-semibold text-sentra-text-primary">
            Configure {integration.name}
          </h2>
          <button
            onClick={onClose}
            className="text-sentra-text-muted hover:text-sentra-text-primary transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {Object.entries(config).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-sentra-text-secondary mb-1.5 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="text"
                value={value}
                onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-tertiary border border-sentra-border-strong rounded-lg text-sentra-text-primary focus:outline-none focus:ring-2 focus:ring-sentra-border-strong focus:border-transparent"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(integration.id, config)
                onClose()
              }}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConnectionLogs({ logs }: { logs: ConnectionLog[] }) {
  const getLogStatusColor = (status: ConnectionLog['status']) => {
    switch (status) {
      case 'success':
        return 'text-emerald-400'
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-amber-400'
      default:
        return 'text-sentra-text-secondary'
    }
  }

  return (
    <div className="bg-surface-secondary border border-sentra-border-medium rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-sentra-border-medium">
        <h3 className="text-sm font-semibold text-sentra-text-primary flex items-center gap-2">
          <Activity className="w-4 h-4 text-sentra-text-secondary" />
          Connection Activity
        </h3>
        <button className="text-xs text-sentra-text-muted hover:text-sentra-text-primary transition-colors">
          View All
        </button>
      </div>
      <div className="divide-y divide-sentra-border-medium">
        {logs.map(log => (
          <div
            key={log.id}
            className="px-5 py-3 flex items-start gap-3 hover:bg-surface-tertiary/50 transition-colors"
          >
            <div className={cn('mt-0.5', getLogStatusColor(log.status))}>
              {log.status === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {log.status === 'error' && <AlertCircle className="w-4 h-4" />}
              {log.status === 'warning' && <RefreshCw className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-sentra-text-primary">{log.action}</span>
                <span className="text-xs text-sentra-text-muted">{log.timestamp}</span>
              </div>
              <p className="text-sm text-sentra-text-secondary truncate">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Page Component
export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(FALLBACK_INTEGRATIONS)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<Integration['type'] | 'all'>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [configureModalOpen, setConfigureModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setIntegrations(json.data)
      }
    } catch {
      setIntegrations(FALLBACK_INTEGRATIONS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchIntegrations()
  }, [fetchIntegrations])

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || integration.type === filterType
    return matchesSearch && matchesType
  })

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    disconnected: integrations.filter(i => i.status === 'disconnected').length,
    error: integrations.filter(i => i.status === 'error').length,
  }

  const handleConnect = async (id: string) => {
    setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, status: 'syncing' } : i)))
    try {
      const res = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'connect' }),
      })
      const json = await res.json()
      if (json.success) {
        await fetchIntegrations()
      } else {
        setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, status: 'disconnected' } : i)))
      }
    } catch {
      setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, status: 'disconnected' } : i)))
    }
  }

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'disconnect' }),
      })
      if (res.ok) await fetchIntegrations()
    } catch {
      // Keep local state
    }
  }

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration)
    setConfigureModalOpen(true)
  }

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const res = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'test' }),
      })
      const json = await res.json()
      if (json.success) await fetchIntegrations()
    } finally {
      setTestingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (res.ok) await fetchIntegrations()
    } catch {
      // Keep local state
    }
  }

  const handleAdd = async (newIntegration: Omit<Integration, 'id' | 'status' | 'lastSync'>) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntegration),
      })
      const json = await res.json()
      if (json.success && json.data) await fetchIntegrations()
    } catch {
      // Silent fail
    }
  }

  const handleSaveConfig = async (id: string, config: Record<string, string>) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, config }),
      })
      if (res.ok) await fetchIntegrations()
    } catch {
      // Keep local state
    }
  }

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Header */}
      <div className="border-b border-sentra-border-medium">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-sentra-text-primary">Memory Nodes</h1>
                  <p className="text-sentra-text-secondary text-sm">
                    Manage your external service integrations
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-emerald-900/20"
            >
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-surface-secondary border border-sentra-border-medium rounded-xl p-4">
              <div className="flex items-center gap-2 text-sentra-text-secondary text-sm mb-1">
                <Box className="w-4 h-4" />
                Total Integrations
              </div>
              <div className="text-2xl font-bold text-sentra-text-primary">{stats.total}</div>
            </div>
            <div className="bg-surface-secondary border border-sentra-border-medium rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
              <div className="text-2xl font-bold text-emerald-400">{stats.connected}</div>
            </div>
            <div className="bg-surface-secondary border border-sentra-border-medium rounded-xl p-4">
              <div className="flex items-center gap-2 text-sentra-text-secondary text-sm mb-1">
                <XCircle className="w-4 h-4" />
                Disconnected
              </div>
              <div className="text-2xl font-bold text-sentra-text-secondary">
                {stats.disconnected}
              </div>
            </div>
            <div className="bg-surface-secondary border border-sentra-border-medium rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                <AlertCircle className="w-4 h-4" />
                Errors
              </div>
              <div className="text-2xl font-bold text-red-400">{stats.error}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-surface-secondary border border-sentra-border-medium rounded-xl p-4 sticky top-6">
              <div className="flex items-center gap-2 text-sm font-medium text-sentra-text-primary mb-4">
                <Filter className="w-4 h-4" />
                Filter by Type
              </div>
              <div className="space-y-1">
                {[
                  { value: 'all', label: 'All Types', icon: Box },
                  {
                    value: 'vector-db',
                    label: 'Vector Database',
                    icon: Database,
                  },
                  { value: 'ai-provider', label: 'AI Provider', icon: Zap },
                  { value: 'storage', label: 'Storage', icon: Cloud },
                  {
                    value: 'messaging',
                    label: 'Messaging',
                    icon: MessageSquare,
                  },
                  { value: 'monitoring', label: 'Monitoring', icon: Activity },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFilterType(value as Integration['type'] | 'all')}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                      filterType === value
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-sentra-text-secondary hover:bg-surface-tertiary hover:text-sentra-text-primary'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sentra-text-muted" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary border border-sentra-border-medium rounded-lg text-sentra-text-primary placeholder:text-sentra-text-muted focus:outline-none focus:ring-2 focus:ring-sentra-border-strong focus:border-transparent"
                />
              </div>
            </div>

            {/* Integrations Grid */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <RefreshCw className="w-8 h-8 animate-spin text-sentra-text-muted" />
              </div>
            ) : filteredIntegrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIntegrations.map(integration => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onConfigure={handleConfigure}
                    onTest={handleTest}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface-secondary border border-sentra-border-medium rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-tertiary flex items-center justify-center">
                  <Search className="w-8 h-8 text-sentra-text-muted" />
                </div>
                <h3 className="text-lg font-medium text-sentra-text-primary mb-1">
                  No integrations found
                </h3>
                <p className="text-sentra-text-muted text-sm">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Connection Logs */}
            <div className="pt-6">
              <ConnectionLogs logs={mockLogs} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddIntegrationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />

      <ConfigureModal
        integration={selectedIntegration}
        isOpen={configureModalOpen}
        onClose={() => {
          setConfigureModalOpen(false)
          setSelectedIntegration(null)
        }}
        onSave={handleSaveConfig}
      />
    </div>
  )
}
