#!/usr/bin/env node
/**
 * Cursor postToolUse hook for the Ferdiiskandar app.
 *
 * Purpose:
 * - nudge the agent to refresh IDE diagnostics after write-style tools
 * - remind the agent to keep verification app-scoped and evidence-based
 *
 * Safety:
 * - advisory only
 * - no source mutation
 * - fails open with empty JSON on malformed input
 */
import { stdin } from 'node:process'

const chunks = []
for await (const chunk of stdin) {
  chunks.push(chunk)
}

let input = {}
try {
  input = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
} catch {
  process.stdout.write('{}')
  process.exit(0)
}

const tool = String(input.tool ?? input.toolName ?? input.name ?? '')
const toolJson = JSON.stringify(input)
const isFileWrite =
  /^(Write|StrReplace|ApplyPatch|Edit|NotebookEdit)$/i.test(tool) ||
  /"tool"\s*:\s*"write"/i.test(toolJson) ||
  /search_replace/i.test(toolJson)

if (!isFileWrite) {
  process.stdout.write('{}')
  process.exit(0)
}

const msg = [
  '**Ferdiiskandar diagnostics reminder:** after write-style edits, refresh diagnostics on touched paths or a tight parent scope when `read_lints` is available.',
  'For non-trivial app changes, verify with the narrowest relevant `pnpm` script and report actual evidence. Keep unrelated dirty files untouched.',
].join(' ')

process.stdout.write(
  JSON.stringify({
    additional_context: msg,
  }),
)
process.exit(0)
