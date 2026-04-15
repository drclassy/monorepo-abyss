// ============================================
// ISKANDAR GATEKEEPER - Security & Validation Layer
// ============================================

import * as fs from 'fs'
import * as path from 'path'

import { glob } from 'glob'

/**
 * Auth middleware and verification functions.
 * Only HS256 JWT is accepted — algorithm confusion attacks are rejected at the header level.
 * API key comparison uses timing-safe equality to prevent timing oracle attacks.
 */
export {
  verifyJwt,
  validateApiKey,
  loadApiKeysFromEnv,
  jwtMiddleware,
  apiKeyMiddleware,
  authMiddleware,
} from './auth'

/** Type contracts for JWT payloads, API key configs, and auth results. */
export type { JwtPayload, ApiKeyConfig, ValidationError, AuthResult } from './auth'

// ============================================
// GO-GATE VALIDATOR - Session Approval Check
// ============================================

/**
 * Validates that all recent sessions have GO approval
 * This script is designed to run in CI/CD pipeline
 */

interface ValidationResult {
  passed: boolean
  message: string
  sessions: SessionStatus[]
}

interface SessionStatus {
  path: string
  hasGoApproval: boolean
  status: 'PENDING' | 'GO' | 'COMPLETED' | 'FAILED'
}

const GO_APPROVAL_PATTERNS = ['✅ GO', 'GO APPROVED', '✅ GO APPROVED BY CHIEF', 'GO APPROVED']

const SESSIONS_PATH = path.join(process.cwd(), '.agent/sessions')

async function main(): Promise<void> {
  console.log('🛡️  Iskandar Gatekeeper - GO-Gate Validator')
  console.log('================================------------')
  console.log()

  const result = await validateSessions()

  console.log()
  console.log('================================------------')
  console.log(`Result: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Message: ${result.message}`)
  console.log()

  if (result.sessions.length > 0) {
    console.log('Session Status:')
    result.sessions.forEach((session) => {
      const icon = session.hasGoApproval ? '✅' : '🛑'
      console.log(`  ${icon} ${session.path} - ${session.status}`)
    })
    console.log()
  }

  if (!result.passed) {
    console.error('❌ CI/CD REJECTED: GO-Gate validation failed!')
    console.error()
    console.error('To fix this:')
    console.error('1. Create HANDOFF.md in .agent/sessions/')
    console.error('2. Get GO approval from Chief')
    console.error('3. Add approval string: "✅ GO APPROVED BY CHIEF"')
    console.error()
    process.exit(1)
  }

  console.log('✅ GO-Gate Passed. Proceeding to build...')
  process.exit(0)
}

async function validateSessions(): Promise<ValidationResult> {
  // Check if sessions directory exists
  if (!fs.existsSync(SESSIONS_PATH)) {
    return {
      passed: true,
      message: 'No sessions directory found. Skipping GO-Gate check.',
      sessions: [],
    }
  }

  // Find all HANDOFF.md files
  const handoffFiles = await glob('**/HANDOFF.md', {
    cwd: SESSIONS_PATH,
    absolute: false,
  })

  if (handoffFiles.length === 0) {
    return {
      passed: true,
      message: 'No HANDOFF.md files found. Skipping GO-Gate check.',
      sessions: [],
    }
  }

  const sessions: SessionStatus[] = []
  for (const file of handoffFiles) {
    const fullPath = path.join(SESSIONS_PATH, file)
    const content = fs.readFileSync(fullPath, 'utf-8')

    const hasGoApproval = GO_APPROVAL_PATTERNS.some((pattern) => content.includes(pattern))
    const status = extractStatus(content)

    sessions.push({
      path: file.replace('/HANDOFF.md', ''),
      hasGoApproval,
      status,
    })
  }

  // Check if any session is PENDING without GO approval
  const pendingWithoutGo = sessions.filter((s) => s.status === 'PENDING' && !s.hasGoApproval)

  if (pendingWithoutGo.length > 0) {
    return {
      passed: false,
      message: `${pendingWithoutGo.length} session(s) pending GO approval`,
      sessions,
    }
  }

  return {
    passed: true,
    message: `All ${sessions.length} session(s) have proper approval or are completed`,
    sessions,
  }
}

function extractStatus(content: string): SessionStatus['status'] {
  if (content.includes('✅ COMPLETED') || content.includes('Status: COMPLETED')) {
    return 'COMPLETED'
  }
  if (content.includes('❌ FAILED') || content.includes('Status: FAILED')) {
    return 'FAILED'
  }
  if (content.includes('✅ GO') || content.includes('GO APPROVED')) {
    return 'GO'
  }
  return 'PENDING'
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { validateSessions, type ValidationResult, type SessionStatus }
