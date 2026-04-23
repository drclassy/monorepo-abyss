/**
 * afterFileEdit hook — logs edited files for audit trail
 * Receives: { file_path, edits[], conversation_id, generation_id }
 * Response: informational only (stdout ignored)
 */
import { appendFileSync } from "fs"

let input = ""
process.stdin.setEncoding("utf-8")
process.stdin.on("data", (chunk) => (input += chunk))
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input)
    const timestamp = new Date().toISOString()
    const line = `[${timestamp}] EDIT: ${data.file_path} (${data.edits?.length || 0} changes)\n`
    appendFileSync(".cursor/hooks/edit-log.txt", line)
  } catch {
    // silent — don't break the agent loop
  }
})
