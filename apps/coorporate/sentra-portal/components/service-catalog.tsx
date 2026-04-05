/**
 * PORTAL Sentra — Service Catalog Component
 * Displays available services to create
 */

'use client'

import { Database, Loader2, Mail, MessageSquare, Plus, Zap } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateServiceInput, ServiceDefinition } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface ServiceCatalogProps {
  catalog: ServiceDefinition[]
  onServiceCreated: () => void
  disabled?: boolean
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<string, React.ElementType> = {
  Database,
  Zap,
  Mail,
  MessageSquare,
  Leaf: Database,
}

const typeColors: Record<string, string> = {
  database: 'bg-blue-500/10 text-blue-600',
  cache: 'bg-yellow-500/10 text-yellow-600',
  mail: 'bg-purple-500/10 text-purple-600',
  queue: 'bg-green-500/10 text-green-600',
  search: 'bg-orange-500/10 text-orange-600',
}

// ============================================================================
// Component
// ============================================================================

export function ServiceCatalog({
  catalog,
  onServiceCreated,
  disabled,
}: ServiceCatalogProps): React.JSX.Element {
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    customPort: string
  }>({ name: '', customPort: '' })

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!selectedService) return

    setIsCreating(true)
    try {
      const input: CreateServiceInput = {
        definitionId: selectedService.id,
        name: formData.name || `${selectedService.name} Instance`,
        customPort: formData.customPort ? Number.parseInt(formData.customPort) : undefined,
      }

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (response.ok) {
        setSelectedService(null)
        setFormData({ name: '', customPort: '' })
        onServiceCreated()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create service')
      }
    } catch (error) {
      alert('Failed to create service')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {catalog.map(service => {
          const Icon = iconMap[service.icon] || Database
          return (
            <Card
              key={service.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">Port {service.defaultPort}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={typeColors[service.type]}>
                    {service.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <Button
                  onClick={() => setSelectedService(service)}
                  disabled={disabled}
                  className="w-full gap-1"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Service Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Add {selectedService?.name}</DialogTitle>
              <DialogDescription>
                Configure your {selectedService?.name.toLowerCase()} instance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Instance Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`${selectedService?.name} Instance`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port (optional)</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.customPort}
                  onChange={e => setFormData(prev => ({ ...prev, customPort: e.target.value }))}
                  placeholder={selectedService?.defaultPort.toString()}
                  min={1024}
                  max={65535}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default port {selectedService?.defaultPort}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Service
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
