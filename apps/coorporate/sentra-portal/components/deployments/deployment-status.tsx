'use client'

import {
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  GitCommit,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Deployment {
  id: string
  serviceId: string
  serviceName: string
  environment: 'production' | 'staging' | 'development'
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back'
  commitHash?: string
  branch?: string
  triggeredAt: Date
  buildTime?: number
  deployTime?: number
  url?: string
  rollbackTarget?: string
}

interface DeploymentStatusProps {
  deployments: Deployment[]
  onRollback?: (deploymentId: string, targetId: string) => void
  loading?: boolean
}

export function DeploymentStatus({ deployments, onRollback, loading }: DeploymentStatusProps) {
  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'building':
      case 'deploying':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rolled_back':
        return <RotateCcw className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Deployment['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      building: 'bg-blue-100 text-blue-800 border-blue-200',
      deploying: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rolled_back: 'bg-orange-100 text-orange-800 border-orange-200',
    }

    return (
      <Badge className={`${variants[status]} font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    )
  }

  const getEnvironmentBadge = (environment: Deployment['environment']) => {
    const variants = {
      production: 'bg-red-100 text-red-800 border-red-200',
      staging: 'bg-orange-100 text-orange-800 border-orange-200',
      development: 'bg-green-100 text-green-800 border-green-200',
    }

    return (
      <Badge variant="outline" className={`${variants[environment]} font-medium`}>
        {environment.charAt(0).toUpperCase() + environment.slice(1)}
      </Badge>
    )
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const canRollback = (deployment: Deployment) => {
    return deployment.status === 'success' && !deployment.rollbackTarget
  }

  const recentDeployments = deployments.slice(0, 8)

  return (
    <Card className="bg-neutral-900 border-neutral-800 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Recent Deployments
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
          >
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
          </div>
        ) : recentDeployments.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <GitBranch className="h-8 w-8 mx-auto mb-2 text-neutral-700" />
            <p className="text-sm">No deployments yet</p>
            <p className="text-xs text-neutral-600 mt-1">
              Deployments will appear here once triggered
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDeployments.map(deployment => (
              <div
                key={deployment.id}
                className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 hover:bg-neutral-900 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deployment.status)}
                    <span className="font-medium text-sm text-neutral-300">
                      {deployment.serviceName}
                    </span>
                    {getEnvironmentBadge(deployment.environment)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(deployment.status)}
                    {deployment.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 px-2 text-neutral-500 hover:text-neutral-300"
                      >
                        <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-neutral-500">
                  <div className="flex items-center justify-between">
                    <span>Triggered {formatTimeAgo(deployment.triggeredAt)}</span>
                    <span className="font-mono">
                      {deployment.commitHash?.substring(0, 7) || 'HEAD'}
                    </span>
                  </div>

                  {deployment.branch && (
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      <span>{deployment.branch}</span>
                    </div>
                  )}

                  {(deployment.buildTime || deployment.deployTime) && (
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>Build: {formatDuration(deployment.buildTime)}</span>
                      <span>Deploy: {formatDuration(deployment.deployTime)}</span>
                    </div>
                  )}

                  {deployment.rollbackTarget && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <RotateCcw className="h-3 w-3" />
                      <span>Rolled back from {deployment.rollbackTarget.substring(0, 8)}</span>
                    </div>
                  )}
                </div>

                {canRollback(deployment) && onRollback && (
                  <div className="mt-3 pt-3 border-t border-neutral-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // In a real implementation, you'd show a modal to select rollback target
                        // For now, we'll just trigger with the most recent successful deployment
                        const target = recentDeployments.find(
                          d =>
                            d.serviceId === deployment.serviceId &&
                            d.status === 'success' &&
                            d.id !== deployment.id
                        )
                        if (target) {
                          onRollback(deployment.id, target.id)
                        }
                      }}
                      className="w-full text-xs border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                    >
                      <RotateCcw className="h-3 w-3 mr-2" />
                      Rollback
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
