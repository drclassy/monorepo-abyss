import { launchUnicomAgent, type LaunchUnicomAgentOptions } from './launcher.js'

const DEFAULT_CODEX_CAPABILITIES = [
  'room-read',
  'room-write',
  'code-edit',
  'verification-run',
  'handoff',
]

export interface LaunchCodexUnicomOptions extends Omit<
  LaunchUnicomAgentOptions,
  'id' | 'displayName' | 'role' | 'capabilities'
> {
  id?: string
  displayName?: string
  role?: string
  capabilities?: string[]
}

export function launchCodexUnicomAdapter(options: LaunchCodexUnicomOptions) {
  const { id, displayName, role, capabilities, ...rest } = options
  return launchUnicomAgent({
    ...rest,
    id: id ?? 'codex-agent',
    displayName: displayName ?? 'Codex',
    role: role ?? 'builder',
    capabilities: capabilities ?? DEFAULT_CODEX_CAPABILITIES,
  })
}
