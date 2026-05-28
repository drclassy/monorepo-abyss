import { launchUnicomAgent, type LaunchUnicomAgentOptions } from './launcher.js'

const DEFAULT_CLAUDE_CODE_CAPABILITIES = [
  'room-read',
  'room-write',
  'verification-run',
  'policy-review',
  'handoff',
]

export interface LaunchClaudeCodeUnicomOptions extends Omit<
  LaunchUnicomAgentOptions,
  'id' | 'displayName' | 'role' | 'capabilities'
> {
  id?: string
  displayName?: string
  role?: string
  capabilities?: string[]
}

export function launchClaudeCodeUnicomAdapter(options: LaunchClaudeCodeUnicomOptions) {
  const { id, displayName, role, capabilities, ...rest } = options
  return launchUnicomAgent({
    ...rest,
    id: id ?? 'claude-code-agent',
    displayName: displayName ?? 'Claude Code',
    role: role ?? 'quality',
    capabilities: capabilities ?? DEFAULT_CLAUDE_CODE_CAPABILITIES,
  })
}
