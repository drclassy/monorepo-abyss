export const dynamic = 'force-dynamic'

import {
  AlertCircle,
  CheckCircle,
  Database,
  Folder,
  Globe,
  Server,
  Settings,
  Shield,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { checkDatabaseHealth } from '@/lib/db'
import { dockerManager } from '@/lib/docker-manager'

export default async function SettingsPage(): Promise<React.ReactElement> {
  const dbHealth = checkDatabaseHealth()
  const dockerAvailable = dockerManager.isAvailable()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-surface-page min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-sentra-text-primary tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8 text-sentra-text-muted" />
            Settings
          </h2>
          <p className="text-sentra-text-muted mt-1 text-sm">Configure your Sentra Portal</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* System Status */}
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sentra-text-primary">
              <Server className="h-5 w-5 text-sentra-text-muted" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sentra-text-secondary">
                <CheckCircle className="h-4 w-4 text-sentra-text-muted" />
                <span>Portal API</span>
              </div>
              <Badge
                variant="outline"
                className="text-sentra-text-secondary border-sentra-border-strong bg-surface-primary"
              >
                Running
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sentra-text-secondary">
                <Database className="h-4 w-4 text-sentra-text-muted" />
                <span>SQLite Database</span>
              </div>
              <Badge
                variant="outline"
                className={
                  dbHealth.ok
                    ? 'text-green-400 border-green-500/30 bg-green-500/5'
                    : 'text-red-400 border-red-500/30 bg-red-500/5'
                }
              >
                {dbHealth.ok ? 'Connected' : 'Error'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sentra-text-secondary">
                <Globe className="h-4 w-4 text-sentra-text-muted" />
                <span>Docker Integration</span>
              </div>
              <Badge
                variant="outline"
                className={
                  dockerAvailable
                    ? 'text-green-400 border-green-500/30 bg-green-500/5'
                    : 'text-amber-400 border-amber-500/30 bg-amber-500/5'
                }
              >
                {dockerAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sentra-text-primary">
              <Shield className="h-5 w-5 text-sentra-text-muted" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sentra-text-secondary">
                <Folder className="h-4 w-4 text-sentra-text-muted" />
                <span>Project Manager</span>
              </div>
              <Badge className="bg-surface-tertiary text-sentra-text-secondary border-sentra-border-strong">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sentra-text-secondary">
                <Database className="h-4 w-4 text-sentra-text-muted" />
                <span>Service Manager</span>
              </div>
              <Badge className="bg-surface-tertiary text-sentra-text-secondary border-sentra-border-strong">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sentra-text-secondary">
                <Globe className="h-4 w-4 text-sentra-text-muted" />
                <span>Tunnel Plugin</span>
              </div>
              <Badge className="bg-surface-tertiary text-sentra-text-secondary border-sentra-border-strong">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sentra-text-secondary">
                <Shield className="h-4 w-4 text-sentra-text-muted" />
                <span>Environment Vault</span>
              </div>
              <Badge className="bg-surface-tertiary text-sentra-text-secondary border-sentra-border-strong">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="md:col-span-2 bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader>
            <CardTitle className="text-sentra-text-primary">About Sentra Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-sentra-text-secondary">
              <p>
                <strong className="text-sentra-text-primary">Version:</strong> 1.0.0
              </p>
              <p>
                <strong className="text-sentra-text-primary">Stack:</strong> Next.js 15 + React 19 +
                TypeScript + SQLite
              </p>
              <p>
                <strong className="text-sentra-text-primary">Features:</strong> Project Manager,
                Service Manager, Database GUI, Tunnel Plugin, Environment Vault
              </p>
              <p className="pt-2 text-sentra-text-muted">
                Sentra Portal is a centralized intelligence and agent orchestration hub for solo
                developers, providing an all-in-one local development platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
