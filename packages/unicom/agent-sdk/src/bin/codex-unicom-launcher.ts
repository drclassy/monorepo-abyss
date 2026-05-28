#!/usr/bin/env node

import { launchCodexUnicomAdapter } from '../codex-launcher.js'

import { runAgentLauncher } from './shared-launcher.js'

await runAgentLauncher({
  agentLabel: 'Codex',
  launch: launchCodexUnicomAdapter,
  defaultAliases: ['@codex', 'codex', 'codex-agent'],
  defaultIntroduction: 'Codex online di UNICOM. Sebut @codex untuk membangunkan saya di room ini.',
})
