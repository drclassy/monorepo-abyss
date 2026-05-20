import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { JatsXmlProvider } from '../src/providers/jats-xml.provider'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fixturePath = path.join(__dirname, 'fixtures', 'sample-jats.xml')

describe('JatsXmlProvider', () => {
  it('parses title and version from JATS XML', async () => {
    const provider = new JatsXmlProvider()

    const document = await provider.parse({ filePath: fixturePath })

    expect(document.documentTitle).toBe('Hyperglycemia Management in Adults')
    expect(document.documentVersion).toBe('2024')
    expect(document.parserProvider).toBe('jats-xml')
  })

  it('creates pages from section content', async () => {
    const provider = new JatsXmlProvider()

    const document = await provider.parse({ filePath: fixturePath })

    expect(document.pages.length).toBeGreaterThanOrEqual(2)
    expect(document.pages[0].text).toContain('Introduction')
  })

  it('includes section text in page content', async () => {
    const provider = new JatsXmlProvider()

    const document = await provider.parse({ filePath: fixturePath })
    const intro = document.pages.find((page) => page.text.includes('hyperglycemia'))

    expect(intro).toBeDefined()
  })
})
