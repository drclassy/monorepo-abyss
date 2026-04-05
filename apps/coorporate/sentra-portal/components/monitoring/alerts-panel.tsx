'use client'

import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  ExternalLink,
  Info,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  source: string // e.g., 'railway', 'sentry', 'system'
  timestamp: Date
  acknowledged?: boolean
  actionUrl?: string
  metadata?: Record<string, any>
}

interface AlertsPanelProps {
  alerts: Alert[]
  onAcknowledge?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
  maxItems?: number
}

export function AlertsPanel({ alerts, onAcknowledge, onDismiss, maxItems = 5 }: AlertsPanelProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getAlertBadge = (type: Alert['type']) => {
    const variants = {
      error: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
    }

    return (
      <Badge className={`${variants[type]} font-medium text-xs`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getSourceBadge = (source: string) => {
    const colors = {
      railway: 'bg-blue-100 text-blue-800 border-blue-200',
      sentry: 'bg-purple-100 text-purple-800 border-purple-200',
      system: 'bg-gray-100 text-gray-800 border-gray-200',
      docker: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    }

    return (
      <Badge
        variant="outline"
        className={`${colors[source as keyof typeof colors] || colors.system} font-medium text-xs`}
      >
        {source}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const displayedAlerts = alerts.slice(0, maxItems)
  const hasMoreAlerts = alerts.length > maxItems

  return (
    <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-sentra-text-secondary flex items-center gap-2">
            <Bell className="h-4 w-4 text-sentra-text-muted" />
            Recent Alerts
          </CardTitle>
          <Badge
            variant="outline"
            className="text-xs text-sentra-text-muted border-sentra-border-strong"
          >
            {alerts.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {displayedAlerts.length === 0 ? (
          <div className="text-center py-8 text-sentra-text-muted">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">All systems operational</p>
            <p className="text-xs text-sentra-text-muted mt-1">No active alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.type === 'error'
                    ? 'bg-red-950/20 border-red-800/50'
                    : alert.type === 'warning'
                      ? 'bg-yellow-950/20 border-yellow-800/50'
                      : alert.type === 'success'
                        ? 'bg-green-950/20 border-green-800/50'
                        : 'bg-blue-950/20 border-blue-800/50'
                } ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-sentra-text-primary truncate">
                        {alert.title}
                      </h4>
                      {getAlertBadge(alert.type)}
                      {getSourceBadge(alert.source)}
                    </div>
                    <p className="text-sm text-sentra-text-secondary mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sentra-text-muted">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      <div className="flex items-center gap-1">
                        {alert.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-6 px-2 text-xs text-sentra-text-muted hover:text-sentra-text-primary"
                          >
                            <a href={alert.actionUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        {!alert.acknowledged && onAcknowledge && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAcknowledge(alert.id)}
                            className="h-6 px-2 text-xs text-sentra-text-muted hover:text-sentra-text-primary"
                          >
                            <BellOff className="h-3 w-3" />
                          </Button>
                        )}
                        {onDismiss && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDismiss(alert.id)}
                            className="h-6 px-2 text-xs text-sentra-text-muted hover:text-sentra-text-primary"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {hasMoreAlerts && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-sentra-text-muted hover:text-sentra-text-primary"
                >
                  View {alerts.length - maxItems} more alerts
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
