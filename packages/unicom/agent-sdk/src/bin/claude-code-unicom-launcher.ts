#!/usr/bin/env node

import { launchClaudeCodeUnicomAdapter } from '../claude-code-launcher.js'

import { runAgentLauncher } from './shared-launcher.js'

await runAgentLauncher({
  agentLabel: 'Claude Code',
  launch: launchClaudeCodeUnicomAdapter,
  defaultAliases: ['@claude', '@claude-code', 'claude code', 'claude-code-agent'],
  defaultIntroduction:
    'Claude Code online di UNICOM. Sebut @claude atau @claude-code untuk membangunkan saya di room ini.',
})
