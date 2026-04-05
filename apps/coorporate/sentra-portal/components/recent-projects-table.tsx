'use client'

import { ExternalLink, Folder, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Project } from '@/types'

export function RecentProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Show last 5 projects
          setProjects(data.data.projects.slice(0, 5))
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">Running</Badge>
      case 'starting':
        return <Badge variant="secondary">Starting</Badge>
      case 'stopped':
        return <Badge variant="outline">Stopped</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-blue-500" />
          Recent Projects
        </CardTitle>
        <a
          href="/projects"
          className="text-sm text-blue-500 hover:underline flex items-center gap-1"
        >
          View all <ExternalLink className="h-3 w-3" />
        </a>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
            <p>No projects yet</p>
            <a href="/projects" className="text-blue-500 hover:underline mt-2">
              Create your first project
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{project.name}</span>
                    {getStatusBadge(project.status)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    Port {project.port} • {project.path}
                  </p>
                </div>
                <a
                  href={`http://localhost:${project.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 text-blue-500 hover:text-blue-600"
                  title="Open in browser"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
