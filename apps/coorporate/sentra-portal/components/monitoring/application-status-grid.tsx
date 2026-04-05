'use client'

import { AlertTriangle, CheckCircle, Clock, ExternalLink, RefreshCw, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Application {
  id: string
  name: string
  environment: 'production' | 'staging' | 'development'
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  url?: string
  lastDeployment?: Date
  uptime: number // percentage
  responseTime: number // ms
  errorRate: number // per minute
  activeUsers?: number
}

interface ApplicationStatusGridProps {
  applications: Application[]
  onRefresh?: () => void
  loading?: boolean
}

export function ApplicationStatusGrid({
  applications,
  onRefresh,
  loading,
}: ApplicationStatusGridProps) {
  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Application['status']) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      unknown: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return (
      <Badge className={`${variants[status]} font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getEnvironmentBadge = (environment: Application['environment']) => {
    const variants = {
      production: 'bg-blue-100 text-blue-800 border-blue-200',
      staging: 'bg-orange-100 text-orange-800 border-orange-200',
      development: 'bg-purple-100 text-purple-800 border-purple-200',
    }

    return (
      <Badge variant="outline" className={`${variants[environment]} font-medium`}>
        {environment.charAt(0).toUpperCase() + environment.slice(1)}
      </Badge>
    )
  }

  return (
    <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-sentra-text-secondary flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Application Status
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="text-sentra-text-muted hover:text-sentra-text-primary hover:bg-surface-hover"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map(app => (
            <div
              key={app.id}
              className="p-4 bg-surface-primary rounded-lg border border-sentra-border-medium hover:bg-surface-secondary transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(app.status)}
                  <h3 className="font-medium text-sm text-sentra-text-primary">{app.name}</h3>
                </div>
                {getEnvironmentBadge(app.environment)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sentra-text-muted">Status</span>
                  {getStatusBadge(app.status)}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-sentra-text-muted">Uptime</span>
                  <span className="text-sentra-text-primary font-mono">
                    {app.uptime.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-sentra-text-muted">Response Time</span>
                  <span className="text-sentra-text-primary font-mono">{app.responseTime}ms</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-sentra-text-muted">Error Rate</span>
                  <span className="text-sentra-text-primary font-mono">
                    {app.errorRate.toFixed(2)}/min
                  </span>
                </div>

                {app.activeUsers !== undefined && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sentra-text-muted">Active Users</span>
                    <span className="text-sentra-text-primary font-mono">{app.activeUsers}</span>
                  </div>
                )}

                {app.lastDeployment && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sentra-text-muted">Last Deploy</span>
                    <span className="text-sentra-text-primary">
                      {new Date(app.lastDeployment).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {app.url && (
                <div className="mt-3 pt-3 border-t border-sentra-border-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full text-sentra-text-secondary hover:text-sentra-text-primary hover:bg-surface-hover"
                  >
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open App
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-8 text-sentra-text-muted">
            <Clock className="h-8 w-8 mx-auto mb-2 text-sentra-text-tertiary" />
            <p className="text-sm">No applications configured</p>
            <p className="text-xs text-sentra-text-muted mt-1">
              Configure applications in settings to monitor their status
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
