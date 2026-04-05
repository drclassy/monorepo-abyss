'use client'

import { Activity, Database, Loader2, Mail, Server, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ServiceInstance } from '@/types'

const iconMap: Record<string, typeof Server> = {
  Database,
  Zap,
  Mail,
  Server,
}

export function ActiveServicesList() {
  const [services, setServices] = useState<ServiceInstance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
    // Refresh every 5 seconds
    const interval = setInterval(fetchServices, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Show only running services, max 5
          const running = data.data.services
            .filter((s: ServiceInstance) => s.status === 'running')
            .slice(0, 5)
          setServices(running)
        }
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (service: ServiceInstance) => {
    // Try to determine icon based on service name or definition
    if (service.name.toLowerCase().includes('postgres')) return Database
    if (service.name.toLowerCase().includes('mysql')) return Database
    if (service.name.toLowerCase().includes('redis')) return Zap
    if (service.name.toLowerCase().includes('mail')) return Mail
    return Server
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Active Services
        </CardTitle>
        <a href="/services" className="text-sm text-blue-500 hover:underline">
          Manage
        </a>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
            <p>No active services</p>
            <a href="/services" className="text-blue-500 hover:underline mt-2">
              Start a service
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(service => {
              const Icon = getServiceIcon(service)
              const mainPort = Object.values(service.ports)[0]

              return (
                <div key={service.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{service.name}</span>
                      <Badge className="bg-green-500 text-xs">Running</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">localhost:{mainPort}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
