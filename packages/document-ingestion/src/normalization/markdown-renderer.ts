import type { CanonicalDocument } from '../types'

/**
 * Renders a CanonicalDocument into deterministic Markdown.
 *
 * Format:
 *   ---
 *   document_id: doc_xxx
 *   source_hash: xxx
 *   document_version: v1
 *   parser_provider: liteparse
 *   ingestion_status: ready
 *   ---
 *
 *   <!-- source_hash:xxx page_number:1 parser_provider:liteparse -->
 *   ## Page 1
 *
 *   [page content]
 */
export function renderMarkdown(doc: CanonicalDocument): string {
  const { documentId, sourceHash, documentVersion, parserProvider, qualityReport, pages } = doc

  const frontmatter = [
    '---',
    `document_id: ${documentId}`,
    `source_hash: ${sourceHash}`,
    `document_version: ${documentVersion}`,
    `parser_provider: ${parserProvider}`,
    `ingestion_status: ${qualityReport.status}`,
    doc.documentTitle ? `document_title: "${doc.documentTitle}"` : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n')

  const pageSections = pages.map((page) => {
    const marker = `<!-- source_hash:${sourceHash} page_number:${page.pageNumber} parser_provider:${parserProvider} -->`
    const heading = `## Page ${page.pageNumber}`
    const content = page.text.trim() || '_[empty page]_'
    return [marker, heading, '', content].join('\n')
  })

  return [frontmatter, '', ...pageSections].join('\n\n')
}
