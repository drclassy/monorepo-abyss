import { readFileSync } from 'node:fs'

import { createSourceHash } from '../hashing/source-hash'
import type { CanonicalDocument, CanonicalPage, ParseInput } from '../types'

import type { DocumentParserProvider } from './document-parser-provider'

export class JatsXmlProvider implements DocumentParserProvider {
  name = 'jats-xml' as const

  async parse(input: ParseInput): Promise<CanonicalDocument> {
    const xmlContent = input.buffer
      ? input.buffer.toString('utf-8')
      : input.filePath
        ? readFileSync(input.filePath, 'utf-8')
        : ''

    const sourceBuffer = input.buffer ?? Buffer.from(xmlContent, 'utf-8')
    const sourceHash = createSourceHash(sourceBuffer)
    const documentVersion = input.documentVersion ?? this.extractYear(xmlContent)
    const documentTitle = input.documentTitle ?? this.extractTitle(xmlContent)
    const pages = this.extractSections(xmlContent)
    const documentId = `doc_${sourceHash.slice(0, 16)}_${documentVersion}`

    return {
      documentId,
      sourceHash,
      documentVersion,
      documentTitle,
      parserProvider: 'jats-xml',
      createdAt: new Date().toISOString(),
      preflight: {
        documentType: 'unknown',
        requiresOcr: false,
        confidence: 1,
        reason: 'Born-digital JATS XML does not require OCR.',
        pageSignals: pages.map((page) => ({
          pageNumber: page.pageNumber,
          hasExtractableText: page.text.trim().length > 0,
          textDensity: page.textDensity,
        })),
      },
      qualityReport: {
        status: pages.length > 0 ? 'ready' : 'failed',
        totalPages: pages.length,
        failedPages: [],
        lowConfidencePages: [],
        averageOcrConfidence: null,
        documentType: 'unknown',
        requiresReview: false,
        warnings: [],
      },
      pages,
      metadata: {
        fileName: input.fileName ?? input.filePath,
        mimeType: input.mimeType ?? 'application/xml',
        pageCount: pages.length,
      },
    }
  }

  private extractTitle(xml: string): string {
    const match = xml.match(/<article-title[^>]*>([\s\S]*?)<\/article-title>/i)
    return match ? this.stripTags(match[1]) : 'Unknown Title'
  }

  private extractYear(xml: string): string {
    const match = xml.match(/<pub-date[^>]*>[\s\S]*?<year>(\d{4})<\/year>/i)
    return match ? match[1] : 'unknown'
  }

  private extractSections(xml: string): CanonicalPage[] {
    const pages: CanonicalPage[] = []
    const sectionPattern = /<sec[^>]*>([\s\S]*?)<\/sec>/gi
    let sectionMatch: RegExpExecArray | null
    let pageNumber = 1

    while ((sectionMatch = sectionPattern.exec(xml)) !== null) {
      const sectionContent = sectionMatch[1]
      const titleMatch = sectionContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      const sectionTitle = titleMatch ? this.stripTags(titleMatch[1]) : ''

      const paragraphs: string[] = []
      const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi
      let paragraphMatch: RegExpExecArray | null
      while ((paragraphMatch = paragraphPattern.exec(sectionContent)) !== null) {
        paragraphs.push(this.stripTags(paragraphMatch[1]))
      }

      const text = [sectionTitle, ...paragraphs].filter(Boolean).join('\n\n').trim()
      if (!text) {
        continue
      }

      pages.push({
        pageNumber: pageNumber++,
        text,
        markdown: text,
        parserProvider: 'jats-xml',
        ocrConfidence: null,
        textDensity: text.length,
        requiresReview: false,
      })
    }

    if (pages.length === 0) {
      const abstractMatch = xml.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/i)
      if (abstractMatch) {
        const text = this.stripTags(abstractMatch[1])
        if (text) {
          pages.push({
            pageNumber: 1,
            text,
            markdown: text,
            parserProvider: 'jats-xml',
            ocrConfidence: null,
            textDensity: text.length,
            requiresReview: false,
          })
        }
      }
    }

    return pages
  }

  private stripTags(value: string): string {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}
