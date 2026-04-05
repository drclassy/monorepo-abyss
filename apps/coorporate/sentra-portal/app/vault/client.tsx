/**
 * PORTAL Sentra — Environment Vault Page (Client Component)
 */

'use client'

import {
  AlertCircle,
  Database,
  Download,
  Folder,
  Globe,
  Key,
  Loader2,
  Lock,
  Plus,
  Shield,
  Unlock,
  Upload,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { EnvVariableCard } from '@/components/env-variable-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VaultUnlockDialog } from '@/components/vault-unlock-dialog'
import type { ApiResponse, EnvVariable } from '@/types'

interface VaultStatus {
  initialized: boolean
  unlocked: boolean
}

interface Project {
  id: string
  name: string
}

export default function VaultPageClient(): React.JSX.Element {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<VaultStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [variables, setVariables] = useState<EnvVariable[]>([])
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({})
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')

  // Form state
  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(true)

  // Check vault status on mount
  useEffect(() => {
    checkVaultStatus()
    loadProjects()
  }, [])

  // Load variables when vault is unlocked and project selected
  useEffect(() => {
    if (status?.unlocked && selectedProject) {
      loadVariables(selectedProject)
    }
  }, [status?.unlocked, selectedProject])

  const checkVaultStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/api/vault/status')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStatus(data.data)
          if (!data.data.unlocked) {
            setShowUnlockDialog(true)
          }
        }
      }
    } catch (error) {
      console.error('Failed to check vault status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProjects = async (): Promise<void> => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProjects(data.data.projects)
          // Select first project by default
          if (data.data.projects.length > 0 && !selectedProject) {
            setSelectedProject(data.data.projects[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadVariables = async (projectId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/vault/projects/${projectId}/env`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVariables(data.data.variables)
        }
      }
    } catch (error) {
      console.error('Failed to load variables:', error)
    }
  }

  const handleUnlock = async (): Promise<void> => {
    await checkVaultStatus()
  }

  const handleAddVariable = async (): Promise<void> => {
    if (!selectedProject || !newKey.trim()) return

    try {
      const response = await fetch(`/api/vault/projects/${selectedProject}/env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKey,
          value: newValue,
          isEncrypted,
          description: newDescription,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVariables(prev => [...prev, data.data.variable])
          setNewKey('')
          setNewValue('')
          setNewDescription('')
          setIsAdding(false)
        }
      }
    } catch (error) {
      console.error('Failed to add variable:', error)
    }
  }

  const handleUpdateVariable = async (
    id: string,
    value: string,
    description?: string
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/vault/env/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, description }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVariables(prev => prev.map(v => (v.id === id ? data.data.variable : v)))
          // Clear decrypted cache
          setDecryptedValues(prev => {
            const next = { ...prev }
            delete next[id]
            return next
          })
        }
      }
    } catch (error) {
      console.error('Failed to update variable:', error)
    }
  }

  const handleDeleteVariable = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this variable?')) return

    try {
      const response = await fetch(`/api/vault/env/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setVariables(prev => prev.filter(v => v.id !== id))
        setDecryptedValues(prev => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    } catch (error) {
      console.error('Failed to delete variable:', error)
    }
  }

  const handleRevealVariable = async (id: string): Promise<void> => {
    // If already decrypted, just toggle visibility
    if (decryptedValues[id]) return

    try {
      const response = await fetch(`/api/vault/env/${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDecryptedValues(prev => ({
            ...prev,
            [id]: data.data.variable.value,
          }))
        }
      }
    } catch (error) {
      console.error('Failed to reveal variable:', error)
    }
  }

  const handleExport = async (format: 'json' | 'env'): Promise<void> => {
    if (!selectedProject) return

    try {
      const response = await fetch(
        `/api/vault/projects/${selectedProject}/env/export?format=${format}&decrypt=false`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const blob = new Blob([data.data.content], {
            type: format === 'json' ? 'application/json' : 'text/plain',
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = data.data.filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show unlock dialog if vault not initialized or locked
  if (!status?.unlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-8">
        <div className="p-6 rounded-full bg-muted mb-6">
          <Lock className="h-16 w-16 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Vault Locked</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {status?.initialized
            ? 'The environment vault is locked. Please unlock it to access your secure variables.'
            : 'The environment vault needs to be initialized before you can store encrypted variables.'}
        </p>
        <Button onClick={() => setShowUnlockDialog(true)} size="lg">
          <Unlock className="h-5 w-5 mr-2" />
          {status?.initialized ? 'Unlock Vault' : 'Initialize Vault'}
        </Button>

        <VaultUnlockDialog
          isOpen={showUnlockDialog}
          onClose={() => setShowUnlockDialog(false)}
          isInitialized={status?.initialized || false}
          onUnlock={handleUnlock}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Environment Vault</h2>
            <p className="text-muted-foreground">Securely store and manage environment variables</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-500">
            <Unlock className="h-3 w-3 mr-1" />
            Unlocked
          </Badge>
          <Button variant="outline" onClick={() => setShowUnlockDialog(true)}>
            <Lock className="h-4 w-4 mr-2" />
            Lock
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Select Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Variables Section */}
      {selectedProject && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Environment Variables ({variables.length})</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport('env')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export .env
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export JSON
                </Button>
              </div>
            </div>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>

          {/* Add Variable Form */}
          {isAdding && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add New Variable</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Key</label>
                    <Input
                      value={newKey}
                      onChange={e => setNewKey(e.target.value)}
                      placeholder="DATABASE_URL"
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Value</label>
                    <Input
                      type={isEncrypted ? 'password' : 'text'}
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      placeholder="secret_value"
                      className="mt-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Input
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Database connection string"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="encrypt"
                    checked={isEncrypted}
                    onChange={e => setIsEncrypted(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="encrypt" className="text-sm">
                    Encrypt this value
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddVariable} disabled={!newKey.trim()}>
                    Add Variable
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variables List */}
          {variables.length > 0 ? (
            <div className="grid gap-4">
              {variables.map(variable => (
                <EnvVariableCard
                  key={variable.id}
                  variable={variable}
                  decryptedValue={decryptedValues[variable.id]}
                  onUpdate={handleUpdateVariable}
                  onDelete={handleDeleteVariable}
                  onReveal={handleRevealVariable}
                />
              ))}
            </div>
          ) : (
            <Card className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <Database className="h-12 w-12 mb-4" />
              <p className="mb-4">No environment variables for this project</p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Variable
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Unlock Dialog */}
      <VaultUnlockDialog
        isOpen={showUnlockDialog}
        onClose={() => {
          setShowUnlockDialog(false)
          if (!status?.unlocked) {
            // Refresh status in case user cancelled
            checkVaultStatus()
          }
        }}
        isInitialized={status?.initialized || false}
        onUnlock={handleUnlock}
      />
    </div>
  )
}
