/**
 * Stop hook — Autofix Loop
 *
 * When agent finishes, run lint + typecheck.
 * If errors found → send followup_message → agent auto-fixes.
 * Repeats until clean or MAX_ITERATIONS reached.
 *
 * Receives: { conversation_id, status, loop_count, workspace_roots }
 * Response: { followup_message?: string }
 */
import { execSync } from "child_process"
import { readFileSync, writeFileSync, existsSync } from "fs"

const MAX_ITERATIONS = 5
const SCRATCHPAD = ".cursor/scratchpad.md"

let input = ""
process.stdin.setEncoding("utf-8")
process.stdin.on("data", (chunk) => (input += chunk))
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input)

    // Only loop on completed status
    if (data.status !== "completed") {
      respond({})
      return
    }

    // Safety: stop after MAX_ITERATIONS
    if (data.loop_count >= MAX_ITERATIONS) {
      respond({})
      return
    }

    // Check scratchpad for explicit DONE signal
    if (existsSync(SCRATCHPAD)) {
      const scratchpad = readFileSync(SCRATCHPAD, "utf-8")
      if (scratchpad.includes("AUTOFIX_DONE")) {
        respond({})
        return
      }
    }

    // Run lint + typecheck, capture errors
    const errors = []

    // ESLint
    try {
      execSync("npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0 2>&1", {
        timeout: 30000,
        encoding: "utf-8",
        cwd: process.cwd(),
      })
    } catch (e) {
      if (e.stdout) errors.push(`ESLint errors:\n${e.stdout.slice(0, 1500)}`)
    }

    // TypeScript typecheck
    try {
      execSync("npx tsc --noEmit 2>&1", {
        timeout: 60000,
        encoding: "utf-8",
        cwd: process.cwd(),
      })
    } catch (e) {
      if (e.stdout) errors.push(`TypeScript errors:\n${e.stdout.slice(0, 1500)}`)
    }

    if (errors.length === 0) {
      // All clean — write DONE and stop
      writeFileSync(SCRATCHPAD, `# Autofix Scratchpad\nAUTOFIX_DONE — all checks passed at iteration ${data.loop_count + 1}\n`)
      respond({})
    } else {
      // Errors found — send back to agent
      const errorReport = errors.join("\n\n---\n\n")
      respond({
        followup_message: `[Autofix Loop ${data.loop_count + 1}/${MAX_ITERATIONS}] Lint/typecheck errors found. Fix these:\n\n${errorReport}\n\nAfter fixing, write AUTOFIX_DONE to .cursor/scratchpad.md if all checks pass.`,
      })
    }
  } catch {
    respond({})
  }
})

function respond(obj) {
  console.log(JSON.stringify(obj))
}
