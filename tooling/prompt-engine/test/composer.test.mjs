import test from 'node:test'
import assert from 'node:assert/strict'

const { composePrompt } = await import('../dist/core/composer.js')

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

  assert.match(result.finalPrompt, /Mode: Implement/i)
  assert.match(result.finalPrompt, /abyss-monorepo/)
  assert.match(result.finalPrompt, /Tambahkan tombol copy/)
  assert.equal(result.modeLabel, 'Implement')
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

  assert.match(result.finalPrompt, /Mode: Verify/i)
  assert.match(result.finalPrompt, /Active file: none/i)
  assert.match(result.finalPrompt, /Pastikan command baru/)
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
  assert.match(result.finalPrompt, /Core rule source: unknown/i)
})
