/**
 * afterFileEdit hook — logs edited files for audit trail
 * Receives: { file_path, edits[], conversation_id, generation_id }
 * Response: informational only (stdout ignored)
 */
import { appendFileSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

const REPORT_DIR = process.env.CLINE_REPORT_DIR?.trim() || '.cursor/hooks'
const EDIT_LOG_PATH = join(REPORT_DIR, 'edit-log.txt')

try {
  const input = readFileSync(0, 'utf8')
  if (!input.trim()) process.exit(0)

  const data = JSON.parse(input)
  const timestamp = new Date().toISOString()
  const line = `[${timestamp}] EDIT: ${data.file_path} (${data.edits?.length || 0} changes)\n`
  mkdirSync(REPORT_DIR, { recursive: true })
  appendFileSync(EDIT_LOG_PATH, line)
} catch {
  // silent — don't break the agent loop
}
