// Architected and built by Claudesy.
/**
 * Monorepo Project Scanner
 * Scans D:\Devops\abyss-monorepo\app for real projects
 */

import 'server-only'
import * as fs from 'fs'
import * as path from 'path'
import type { Project, ProjectStatus } from '@/types'

// ============================================================================
// Configuration
// ============================================================================

// Use relative path from current working directory to avoid absolute path issues
const MONOREPO_ROOT = path.resolve(process.cwd(), '..', '..')
const APP_DIR = path.join(MONOREPO_ROOT, 'app')

// Add safety check to prevent scanning user directories
if (APP_DIR.includes('Application Data') || APP_DIR.includes('AppData')) {
  console.error('ERROR: APP_DIR resolved to user directory:', APP_DIR)
  throw new Error('Monorepo scanner detected unsafe path resolution')
}

// Default ports for known projects (to avoid conflicts)
const DEFAULT_PORTS: Record<string, number> = {
  'primary-healthcare': 3001,
  'sentra-portal': 3000,
  referralink: 3003,
  'sentra-assist': 3004,
  'sentra-main': 3005,
  'academic-solutions': 3006,
  ferdiiskandar: 3007,
  template: 3010,
}

// Known project display names
const PROJECT_DISPLAY_NAMES: Record<string, string> = {
  'primary-healthcare': 'Primary Healthcare (PKM Dashboard)',
  'sentra-portal': 'Sentra Portal',
  referralink: 'ReferraLink',
  'sentra-assist': 'Sentra Assist (AADI Extension)',
  'sentra-main': 'Sentra Main',
  'academic-solutions': 'Academic Solutions',
  ferdiiskandar: 'Ferdi Iskandar Portfolio',
  template: 'Project Template',
}

// ============================================================================
// Types
// ============================================================================

interface PackageJson {
  name?: string
  description?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface DetectedProject {
  id: string
  folderName: string
  packageJson?: PackageJson
  hasNodeModules: boolean
  lastModified: Date
}

// ============================================================================
// Scanner Functions
// ============================================================================

/**
 * Check if a folder is a valid project (has package.json)
 */
function isValidProject(folderPath: string): boolean {
  return fs.existsSync(path.join(folderPath, 'package.json'))
}

/**
 * Read and parse package.json
 */
function readPackageJson(folderPath: string): PackageJson | undefined {
  try {
    const content = fs.readFileSync(path.join(folderPath, 'package.json'), 'utf-8')
    return JSON.parse(content) as PackageJson
  } catch {
    return undefined
  }
}

/**
 * Detect project type based on dependencies
 */
function detectProjectType(pkg?: PackageJson): string {
  if (!pkg) return 'unknown'

  const deps = { ...pkg.dependencies, ...pkg.devDependencies }

  if (deps['next']) return 'nextjs'
  if (deps['react']) return 'react'
  if (deps['vue']) return 'vue'
  if (deps['@angular/core']) return 'angular'
  if (deps['wxt'] || deps['plasmo']) return 'browser-extension'
  if (deps['express'] || deps['fastify'] || deps['koa']) return 'node-api'
  if (deps['vite']) return 'vite'

  return 'node'
}

/**
 * Get dev command from package.json
 */
function getDevCommand(pkg?: PackageJson): string {
  if (!pkg?.scripts) return 'npm run dev'

  // Priority order for dev commands
  const priorityScripts = ['dev', 'start:dev', 'develop', 'start']

  for (const script of priorityScripts) {
    if (pkg.scripts[script]) {
      return `npm run ${script}`
    }
  }

  return 'npm run dev'
}

/**
 * Get build command from package.json
 */
function getBuildCommand(pkg?: PackageJson): string {
  if (!pkg?.scripts) return 'npm run build'

  if (pkg.scripts['build']) {
    return 'npm run build'
  }

  return 'npm run build'
}

/**
 * Detect port from common config files
 */
function detectPort(folderPath: string, folderName: string): number {
  // Check for port in next.config files
  const nextConfigFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs']
  for (const configFile of nextConfigFiles) {
    const configPath = path.join(folderPath, configFile)
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8')
        const portMatch = content.match(/port:\s*(\d+)/)
        if (portMatch) {
          return Number.parseInt(portMatch[1], 10)
        }
      } catch {
        // Ignore read errors
      }
    }
  }

  // Check .env files
  const envFiles = ['.env', '.env.local', '.env.development']
  for (const envFile of envFiles) {
    const envPath = path.join(folderPath, envFile)
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8')
        const portMatch = content.match(/PORT\s*=\s*(\d+)/)
        if (portMatch) {
          return Number.parseInt(portMatch[1], 10)
        }
      } catch {
        // Ignore read errors
      }
    }
  }

  // Return default port or generate one
  return DEFAULT_PORTS[folderName] || 3000 + Math.floor(Math.random() * 1000)
}

/**
 * Check if a project is currently running by checking port
 */
async function checkProjectStatus(port: number): Promise<ProjectStatus> {
  // This is a simplified check - in production you'd check actual process
  // For now, return stopped and let the process manager handle it
  return 'stopped'
}

/**
 * Scan all projects in the monorepo app directory
 */
export function scanMonorepoProjects(): DetectedProject[] {
  const projects: DetectedProject[] = []

  try {
    if (!fs.existsSync(APP_DIR)) {
      console.warn(`Monorepo app directory not found: ${APP_DIR}`)
      return projects
    }

    const entries = fs.readdirSync(APP_DIR, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_')) {
        const folderPath = path.join(APP_DIR, entry.name)

        if (isValidProject(folderPath)) {
          const stats = fs.statSync(folderPath)
          const pkg = readPackageJson(folderPath)

          projects.push({
            id: entry.name,
            folderName: entry.name,
            packageJson: pkg,
            hasNodeModules: fs.existsSync(path.join(folderPath, 'node_modules')),
            lastModified: stats.mtime,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error scanning monorepo projects:', error)
  }

  return projects.sort((a, b) => a.folderName.localeCompare(b.folderName))
}

/**
 * Convert detected project to Project type
 */
export async function detectedProjectToProject(detected: DetectedProject): Promise<Project> {
  const pkg = detected.packageJson
  const port = detectPort(path.join(APP_DIR, detected.folderName), detected.folderName)
  const projectType = detectProjectType(pkg)

  return {
    id: detected.folderName,
    name: PROJECT_DISPLAY_NAMES[detected.folderName] || pkg?.name || detected.folderName,
    description: pkg?.description || `${projectType} project in monorepo`,
    path: path.join(APP_DIR, detected.folderName),
    port,
    startCommand: getDevCommand(pkg),
    buildCommand: getBuildCommand(pkg),
    envVars: {},
    status: await checkProjectStatus(port),
    pid: null,
    createdAt: detected.lastModified,
    updatedAt: detected.lastModified,
  }
}

/**
 * Get all projects from monorepo as Project type
 */
export async function getMonorepoProjects(): Promise<Project[]> {
  const detected = scanMonorepoProjects()
  const projects: Project[] = []

  for (const d of detected) {
    projects.push(await detectedProjectToProject(d))
  }

  return projects
}

/**
 * Get a single project by ID
 */
export async function getMonorepoProject(id: string): Promise<Project | null> {
  const folderPath = path.join(APP_DIR, id)

  if (!isValidProject(folderPath)) {
    return null
  }

  const stats = fs.statSync(folderPath)
  const pkg = readPackageJson(folderPath)

  const detected: DetectedProject = {
    id,
    folderName: id,
    packageJson: pkg,
    hasNodeModules: fs.existsSync(path.join(folderPath, 'node_modules')),
    lastModified: stats.mtime,
  }

  return detectedProjectToProject(detected)
}

/**
 * Sync monorepo projects to database
 * Returns array of synced projects
 */
export async function syncMonorepoToDb(): Promise<Project[]> {
  const { ProjectRepository } = await import('./db')
  const monorepoProjects = await getMonorepoProjects()
  const synced: Project[] = []

  for (const project of monorepoProjects) {
    // Check if project already exists in DB
    const existing = ProjectRepository.findById(project.id)

    if (existing) {
      // Update path and other metadata if changed
      const updated = ProjectRepository.update(project.id, {
        path: project.path,
        description: project.description ?? undefined,
        startCommand: project.startCommand,
        buildCommand: project.buildCommand,
      })
      if (updated) synced.push(updated)
    } else {
      // Create new project
      const created = ProjectRepository.create({
        id: project.id,
        name: project.name,
        description: project.description ?? undefined,
        path: project.path,
        port: project.port,
        startCommand: project.startCommand,
        buildCommand: project.buildCommand,
        envVars: project.envVars,
      })
      synced.push(created)
    }
  }

  return synced
}

// ============================================================================
// Export for use in components
// ============================================================================

export type { DetectedProject, PackageJson }
