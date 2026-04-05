/**
 * PORTAL Sentra — Database Seed
 * Seeds demo projects and logs for development.
 * Architected and built by Claudesy.
 */

import { LogRepository, ProjectRepository } from '../lib/db-core'

const DEMO_PROJECTS = [
  {
    name: 'sentra-portal',
    description: 'Command Center dashboard',
    path: 'app/sentra-portal',
    port: 3000,
  },
  {
    name: 'primary-healthcare',
    description: 'Primary healthcare app',
    path: 'app/primary-healthcare',
    port: 3001,
  },
  {
    name: 'academic-solutions',
    description: 'Academic solutions platform',
    path: 'app/academic-solutions',
    port: 3002,
  },
]

const DEMO_LOGS = [
  {
    projectId: 'sentra-portal',
    type: 'system' as const,
    message: 'Server started on port 3000',
  },
  {
    projectId: 'sentra-portal',
    type: 'stdout' as const,
    message: 'Compiled successfully',
  },
  {
    projectId: 'primary-healthcare',
    type: 'system' as const,
    message: 'Database migration applied',
  },
  {
    projectId: 'academic-solutions',
    type: 'stdout' as const,
    message: 'Build completed in 12s',
  },
  {
    projectId: 'sentra-portal',
    type: 'system' as const,
    message: 'Health check passed',
  },
  {
    projectId: 'primary-healthcare',
    type: 'stderr' as const,
    message: 'Warning: Deprecated API usage',
  },
  {
    projectId: 'sentra-portal',
    type: 'stdout' as const,
    message: 'Dashboard metrics refreshed',
  },
  {
    projectId: 'academic-solutions',
    type: 'system' as const,
    message: 'Cache cleared',
  },
]

function seed(): void {
  const projects = ProjectRepository.findAll()
  if (projects.length === 0) {
    console.log('Seeding demo projects...')
    for (const p of DEMO_PROJECTS) {
      ProjectRepository.create({
        name: p.name,
        description: p.description,
        path: p.path,
        port: p.port,
      })
    }
    console.log(`  Added ${DEMO_PROJECTS.length} projects`)
  }

  const allProjects = ProjectRepository.findAll()
  const idByName = Object.fromEntries(allProjects.map(p => [p.name, p.id]))

  const existingLogs = LogRepository.findRecent(100)
  if (existingLogs.length < 5 && allProjects.length > 0) {
    console.log('Seeding demo logs...')
    const logsToInsert = DEMO_LOGS.map(l => {
      const pid = idByName[l.projectId] ?? allProjects[0].id
      return { projectId: pid, type: l.type, message: l.message }
    })
    LogRepository.createMany(logsToInsert)
    console.log(`  Added ${logsToInsert.length} log entries`)
  }

  console.log('Seed complete.')
}

if (require.main === module) {
  seed()
}

export { seed }
