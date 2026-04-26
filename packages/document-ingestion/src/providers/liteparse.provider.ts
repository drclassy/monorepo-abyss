import type { CanonicalDocument, CanonicalPage, ParseInput, PdfPreflightResult } from '../types'
import type { DocumentParserProvider } from './document-parser-provider'
import { IngestionError } from '../errors/ingestion-error'
import { createSourceHash } from '../hashing/source-hash'
import { buildCanonicalDocument } from '../normalization/canonical-document'
import { detectPdfPreflight } from '../detection/pdf-preflight'
import { readFileSync } from 'node:fs'

export class LiteParseProvider implements DocumentParserProvider {
  name = 'liteparse' as const

  async parse(input: ParseInput): Promise<CanonicalDocument> {
    let buffer: Buffer

    try {
      if (input.buffer) {
        buffer = input.buffer
      } else if (input.filePath) {
        buffer = readFileSync(input.filePath)
      } else {
        throw new IngestionError('No file path or buffer provided', 'NO_INPUT')
      }
    } catch (err) {
      if (err instanceof IngestionError) throw err
      throw new IngestionError(
        `Failed to read file: ${input.filePath ?? '(buffer)'}`,
        'FILE_READ_ERROR',
        err,
      )
    }

    const sourceHash = createSourceHash(buffer)

    // Run LiteParse in text mode first for preflight
    let liteparseModule: typeof import('@llamaindex/liteparse')
    try {
      liteparseModule = await import('@llamaindex/liteparse')
    } catch (err) {
      throw new IngestionError('Failed to load LiteParse module', 'PARSE_ERROR', err)
    }

    const { LiteParse } = liteparseModule

    // First pass: text-only for preflight signal
    let preflightPages: CanonicalPage[] = []
    try {
      const preflightParser = new LiteParse({ ocrEnabled: false })
      const preflightResult = await preflightParser.parse(buffer)
      preflightPages = normalizePages(preflightResult, false)
    } catch {
      // Preflight failure is non-fatal — we fall through to OCR mode
    }

    const preflight: PdfPreflightResult = detectPdfPreflight(preflightPages)

    // Second pass: full parse with OCR if required
    let pages: CanonicalPage[] = preflightPages
    if (preflight.requiresOcr) {
      try {
        const ocrParser = new LiteParse({ ocrEnabled: true })
        const ocrResult = await ocrParser.parse(buffer)
        pages = normalizePages(ocrResult, true)
      } catch (err) {
        throw new IngestionError('LiteParse OCR parsing failed', 'PARSE_ERROR', err)
      }
    }

    return buildCanonicalDocument({
      sourceHash,
      pages,
      preflight,
      fileName: input.fileName,
      mimeType: input.mimeType,
      documentVersion: input.documentVersion ?? 'v1',
      documentTitle: input.documentTitle,
    })
  }
}

function normalizePages(
  result: Awaited<ReturnType<InstanceType<typeof import('@llamaindex/liteparse').LiteParse>['parse']>>,
  isOcrMode: boolean,
): CanonicalPage[] {
  // LiteParse ParsedPage shape (v1.5.x):
  //   { pageNum: number, text: string, textItems: TextItem[], boundingBoxes?: BoundingBox[] }
  // TextItem has optional confidence field for OCR passes.
  const rawPages: unknown[] = (result as any).pages ?? []

  return rawPages.map((raw: any, idx: number) => {
    const text: string = raw?.text ?? ''

    // OCR confidence: aggregate from textItems if present, else null
    let ocrConfidence: number | null = null
    if (isOcrMode && Array.isArray(raw?.textItems) && raw.textItems.length > 0) {
      const confidences = raw.textItems
        .map((item: any) => item?.confidence)
        .filter((c: unknown): c is number => typeof c === 'number')
      ocrConfidence =
        confidences.length > 0
          ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
          : null
    }

    const textDensity = text.trim().length

    // Extract bounding boxes if present (deprecated in v2 but still present in v1.5)
    const boundingBoxes = Array.isArray(raw?.boundingBoxes)
      ? raw.boundingBoxes.map((bb: any) => ({
          x: bb.x ?? 0,
          y: bb.y ?? 0,
          width: bb.width ?? 0,
          height: bb.height ?? 0,
          text: bb.text,
        }))
      : undefined

    return {
      // pageNum is 1-indexed in LiteParse; fall back to idx+1 defensively
      pageNumber: typeof raw?.pageNum === 'number' ? raw.pageNum : idx + 1,
      text,
      markdown: text,
      parserProvider: 'liteparse' as const,
      ocrConfidence,
      textDensity,
      requiresReview: isOcrMode && (ocrConfidence === null || ocrConfidence < 0.75),
      boundingBoxes,
    }
  })
}
