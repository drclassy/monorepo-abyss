/**
 * PORTAL Sentra — Setup Script
 * Initializes database and directory structure
 */

import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// ============================================================================
// Configuration
// ============================================================================

// Use local project directory instead of home directory for portability
const DATA_DIR = join(process.cwd(), '.sentra', 'data')
const LOGS_DIR = join(process.cwd(), '.sentra', 'logs')
const PROJECTS_DIR = join(process.cwd(), '.sentra', 'projects')

const DIRECTORIES = [DATA_DIR, LOGS_DIR, PROJECTS_DIR]

// ============================================================================
// Setup Functions
// ============================================================================

function printBanner(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🔧 PORTAL Sentra — Setup                           ║
║           Single Developer Workstation Edition               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`)
}

function createDirectories(): void {
  console.log('📁 Creating directories...')

  for (const dir of DIRECTORIES) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      console.log(`   ✓ Created: ${dir}`)
    } else {
      console.log(`   ✓ Exists:  ${dir}`)
    }
  }
}

async function initializeDatabase(): Promise<void> {
  console.log('\n🗄️  Initializing database...')

  try {
    // Dynamic import to avoid issues during build
    const { checkDatabaseHealth } = require('../lib/db-core')

    // Test connection
    const health = checkDatabaseHealth()

    if (health.ok) {
      console.log('   ✓ Database connected successfully')
    } else {
      console.error('   ✗ Database connection failed:', health.message)
      process.exit(1)
    }

    // Seed demo data if empty
    console.log('\n🌱 Seeding demo data...')
    const { seed } = await import('./seed')
    seed()
  } catch (error) {
    console.error('   ✗ Database initialization failed:')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

function printSummary(): void {
  console.log(`
✅ Setup complete!

📍 Locations:
   • Data:    ${DATA_DIR}
   • Logs:    ${LOGS_DIR}
   • Projects: ${PROJECTS_DIR}

🚀 Next steps:
   1. npm run dev
   2. Open http://localhost:3000

💡 Tip: Add projects from your existing repositories
`)
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  printBanner()
  createDirectories()
  await initializeDatabase()
  printSummary()
}

main()
