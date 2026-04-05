/**
 * PORTAL Sentra — Projects Management Page
 * List, create, and manage projects with server control
 */

'use client'

import { Activity, Clock, Folder, Loader2, Plus } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { ServerControlCard } from '@/components/server-control-card'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ApiResponse, Project } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface ProjectsStats {
  total: number
  running: number
  stopped: number
  error: number
}

// ============================================================================
// Component
// ============================================================================

export default function ProjectsPage(): React.JSX.Element {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    path: '',
    port: 3001,
    startCommand: 'npm run dev',
  })

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/projects')
      const result: ApiResponse<{ projects: Project[] }> = await response.json()

      if (result.success) {
        setProjects(result.data.projects)
      } else {
        setError(result.message || 'Failed to fetch projects')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCreateProject = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setProjects(prev => [result.data.project, ...prev])
        setIsCreateDialogOpen(false)
        setFormData({
          name: '',
          description: '',
          path: '',
          port: 3001,
          startCommand: 'npm run dev',
        })
      } else {
        alert(result.message || 'Failed to create project')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setProjects(prev => prev.filter(p => p.id !== id))
      } else {
        alert(result.message || 'Failed to delete project')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  const handleStatusChange = useCallback(
    (projectId: string, newStatus: Project['status']): void => {
      setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, status: newStatus } : p)))
    },
    []
  )

  // Calculate stats
  const stats: ProjectsStats = {
    total: projects.length,
    running: projects.filter(p => p.status === 'running').length,
    stopped: projects.filter(p => p.status === 'stopped').length,
    error: projects.filter(p => p.status === 'error').length,
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-surface-page min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-sentra-text-primary tracking-tight">
            Projects
          </h2>
          <p className="text-sentra-text-muted mt-1 text-sm">
            Manage your local development servers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary border-0">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-surface-secondary border-sentra-border-medium">
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle className="text-sentra-text-primary">Create New Project</DialogTitle>
                <DialogDescription className="text-sentra-text-muted">
                  Add a new project to manage its local development server.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sentra-text-secondary">
                    Project Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Awesome Project"
                    required
                    className="bg-surface-primary border-sentra-border-medium text-sentra-text-primary placeholder:text-sentra-text-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sentra-text-secondary">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description..."
                    className="bg-surface-primary border-sentra-border-medium text-sentra-text-primary placeholder:text-sentra-text-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="path" className="text-sentra-text-secondary">
                    Project Path
                  </Label>
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={e => setFormData(prev => ({ ...prev, path: e.target.value }))}
                    placeholder="/path/to/project"
                    required
                    className="bg-surface-primary border-sentra-border-medium text-sentra-text-primary placeholder:text-sentra-text-muted"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="port" className="text-sentra-text-secondary">
                      Port
                    </Label>
                    <Input
                      id="port"
                      type="number"
                      value={formData.port}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          port: Number.parseInt(e.target.value),
                        }))
                      }
                      min={1024}
                      max={65535}
                      required
                      className="bg-surface-primary border-sentra-border-medium text-sentra-text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="command" className="text-sentra-text-secondary">
                      Start Command
                    </Label>
                    <Input
                      id="command"
                      value={formData.startCommand}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          startCommand: e.target.value,
                        }))
                      }
                      placeholder="npm run dev"
                      required
                      className="bg-surface-primary border-sentra-border-medium text-sentra-text-primary placeholder:text-sentra-text-muted"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary"
                >
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">
              Total Projects
            </CardTitle>
            <Folder className="h-4 w-4 text-sentra-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sentra-text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">
              Running
            </CardTitle>
            <Activity className="h-4 w-4 text-sentra-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sentra-text-primary">{stats.running}</div>
          </CardContent>
        </Card>
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">
              Stopped
            </CardTitle>
            <Clock className="h-4 w-4 text-sentra-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sentra-text-primary">{stats.stopped}</div>
          </CardContent>
        </Card>
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">Error</CardTitle>
            <Activity className="h-4 w-4 text-sentra-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sentra-text-primary">{stats.error}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-surface-secondary border border-sentra-border-medium text-sentra-text-secondary">
          <p>Error: {error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProjects}
            className="mt-2 border-sentra-border-strong text-sentra-text-secondary hover:bg-surface-hover"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-sentra-text-muted" />
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map(project => (
            <Card
              key={project.id}
              className="bg-surface-secondary border-sentra-border-medium shadow-none"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-sentra-text-primary">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 text-sentra-text-muted">
                      {project.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={project.status === 'running' ? 'default' : 'secondary'}
                    className="bg-surface-tertiary text-sentra-text-secondary border-sentra-border-strong"
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-sentra-text-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Path:</span>
                    <span className="font-mono truncate max-w-[200px] text-sentra-text-secondary">
                      {project.path}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Port:</span>
                    <span className="font-mono text-sentra-text-secondary">{project.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Command:</span>
                    <span className="font-mono truncate max-w-[200px] text-sentra-text-secondary">
                      {project.startCommand}
                    </span>
                  </div>
                </div>

                <ServerControlCard
                  project={project}
                  onStatusChange={status => handleStatusChange(project.id, status)}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sentra-text-muted hover:text-sentra-text-primary hover:bg-surface-hover"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Delete Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-sentra-border-medium rounded-lg bg-surface-secondary">
          <Folder className="h-12 w-12 text-sentra-text-muted mb-4" />
          <p className="text-sentra-text-muted mb-4">No projects yet</p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create your first project
          </Button>
        </div>
      )}
    </div>
  )
}
