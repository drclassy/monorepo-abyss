import test from 'node:test'
import assert from 'node:assert/strict'

const { buildPromptEngineHtml } = await import('../dist/webview/prompt-engine-view.js')

test('renders a compact sidebar home with direct actions into the full console', () => {
  const html = buildPromptEngineHtml({
    repoName: 'abyss-monorepo',
    workspacePath: 'D:\\Devops\\abyss-monorepo',
    activeFilePath: 'tooling/prompt-engine/src/extension.ts',
    coreRuleSource: '.cursor/rules/00-core.mdc',
    mode: 'implement',
    view: 'compose',
    auditSourceKind: 'selection',
    auditSourceText: 'Prompt draft',
    composed: null,
    surface: 'sidebar',
  })

  assert.match(html, /SENTRA PROMPT HOME/i)
  assert.match(html, /Open Full Console/i)
  assert.match(html, /Audit Active Prompt/i)
})

test('keeps the full console layout for panel mode', () => {
  const html = buildPromptEngineHtml({
    repoName: 'abyss-monorepo',
    workspacePath: 'D:\\Devops\\abyss-monorepo',
    activeFilePath: 'tooling/prompt-engine/src/extension.ts',
    coreRuleSource: '.cursor/rules/00-core.mdc',
    mode: 'implement',
    view: 'compose',
    auditSourceKind: 'selection',
    auditSourceText: 'Prompt draft',
    composed: null,
    surface: 'panel',
  })

  assert.match(html, /SENTRA PROMPT CONSOLE/i)
  assert.doesNotMatch(html, /SENTRA PROMPT HOME/i)
  assert.doesNotMatch(html, /Repo:/i)
  assert.doesNotMatch(html, /Workspace:/i)
  assert.doesNotMatch(html, /Active file:/i)
  assert.doesNotMatch(html, /Rule:/i)
  assert.doesNotMatch(html, /Audit source:/i)
  assert.match(html, /font-size:\s*28px;/i)
  assert.match(html, /font:\s*13px\/1\.55/i)
})
