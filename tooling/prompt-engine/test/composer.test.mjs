import test from 'node:test'
import assert from 'node:assert/strict'

const { canWriteBackPromptSource, composePrompt, getPromptSourceLabel } =
  await import('../dist/core/composer.js')

test('builds an implement prompt with lightweight context', () => {
  const result = composePrompt({
    mode: 'implement',
    rawInput: 'Tambahkan tombol copy untuk hasil prompt.',
    context: {
      repoName: 'abyss-monorepo',
      workspacePath: 'D:\\Devops\\abyss-monorepo',
      activeFilePath: 'tooling/prompt-engine/src/extension.ts',
      coreRuleSource: '.cursor/rules/00-core.mdc',
    },
  })

  assert.match(result.finalPrompt, /# CODEX MISSION/i)
  assert.match(result.finalPrompt, /## Mode/i)
  assert.match(result.finalPrompt, /Implementation/i)
  assert.match(result.finalPrompt, /## Scope/i)
  assert.match(result.finalPrompt, /## Verification Commands/i)
  assert.match(result.finalPrompt, /abyss-monorepo/)
  assert.equal(result.modeLabel, 'Implementation')
})

test('falls back safely when active file is missing', () => {
  const result = composePrompt({
    mode: 'verify',
    rawInput: 'Pastikan command baru tidak merusak audit flow.',
    context: {
      repoName: 'abyss-monorepo',
      workspacePath: 'D:\\Devops\\abyss-monorepo',
      activeFilePath: '',
      coreRuleSource: '.cursor/rules/00-core.mdc',
    },
  })

  assert.match(result.finalPrompt, /Review \/ Read-Only Audit/i)
  assert.match(result.finalPrompt, /Active area: read-only discovery/i)
  assert.match(result.finalPrompt, /inspect repository structure for evidence only/i)
})

test('keeps output stable when workspace metadata is sparse', () => {
  const result = composePrompt({
    mode: 'plan',
    rawInput: 'Buat command baru untuk membuka webview composer.',
    context: {
      repoName: '',
      workspacePath: '',
      activeFilePath: '',
      coreRuleSource: '',
    },
  })

  assert.match(result.finalPrompt, /Repository: unknown/i)
  assert.match(result.finalPrompt, /Workspace: unknown/i)
  assert.match(result.finalPrompt, /Rule source: unknown/i)
  assert.match(result.finalPrompt, /## Non-Scope/i)
  assert.match(result.finalPrompt, /## Stop Condition/i)
})

test('maps prompt source labels for the console surface', () => {
  assert.equal(getPromptSourceLabel('selection'), 'Active Selection')
  assert.equal(getPromptSourceLabel('document'), 'Current File')
  assert.equal(getPromptSourceLabel('clipboard'), 'Clipboard')
  assert.equal(getPromptSourceLabel('blank'), 'Blank Draft')
})

test('allows write-back only for editor-backed prompt sources', () => {
  assert.equal(canWriteBackPromptSource('selection'), true)
  assert.equal(canWriteBackPromptSource('document'), true)
  assert.equal(canWriteBackPromptSource('clipboard'), false)
  assert.equal(canWriteBackPromptSource('blank'), false)
})
