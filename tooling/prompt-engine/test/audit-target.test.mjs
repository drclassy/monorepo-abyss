import test from 'node:test'
import assert from 'node:assert/strict'

const { resolveAuditTarget } = await import('../dist/core/composer.js')

test('uses selected text when the editor has a non-empty selection', () => {
  const result = resolveAuditTarget({
    selectionText: 'Selected prompt draft',
    documentText: 'Full document prompt draft',
  })

  assert.equal(result.source, 'selection')
  assert.equal(result.selectedText, 'Selected prompt draft')
  assert.equal(result.notice, '')
})

test('falls back to the active document when selection is empty', () => {
  const result = resolveAuditTarget({
    selectionText: '   ',
    documentText: 'Full document prompt draft',
  })

  assert.equal(result.source, 'document')
  assert.equal(result.selectedText, 'Full document prompt draft')
  assert.match(result.notice, /auditing the current file content/i)
})

test('returns none when neither selection nor document has prompt content', () => {
  const result = resolveAuditTarget({
    selectionText: '',
    documentText: '   ',
  })

  assert.equal(result.source, 'none')
  assert.equal(result.selectedText, '')
  assert.match(result.notice, /prompt console/i)
})
