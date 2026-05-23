import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

test('contributes a dedicated Sentra Prompt sidebar container and home view', () => {
  const activityBarViews = packageJson.contributes?.viewsContainers?.activitybar ?? []
  const promptContainer = activityBarViews.find((view) => view.id === 'sentraPrompt')

  assert.ok(promptContainer, 'expected an activity bar container for Sentra Prompt')
  assert.equal(promptContainer.title, 'Sentra Prompt')

  const promptViews = packageJson.contributes?.views?.sentraPrompt ?? []
  const promptHomeView = promptViews.find((view) => view.id === 'sentraPrompt.home')

  assert.ok(promptHomeView, 'expected a Sentra Prompt home view inside the sidebar container')
  assert.equal(promptHomeView.type, 'webview')
})

test('exposes an editor title action for quick audit without relying on the command palette', () => {
  const editorTitleMenu = packageJson.contributes?.menus?.['editor/title'] ?? []

  assert.ok(
    editorTitleMenu.some((item) => item.command === 'sentraPrompt.auditCodexPrompt'),
    'expected the audit command to appear in the editor title menu'
  )
})
