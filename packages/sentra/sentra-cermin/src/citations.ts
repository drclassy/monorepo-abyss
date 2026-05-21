// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.

export interface ConsumableGroundedCitation {
  citationLabel: string
  source: {
    sourceHash: string
    documentId?: string
    documentVersion?: string
    sourceTitle?: string
    parserProvider?: string
  }
  evidence: {
    chunkId?: string
    vectorId?: string
    pageNumber: number | null
    chunkIndex?: number
    textSpan?: {
      start?: number
      end?: number
    }
    ocrConfidence: number | null
    retrievalScore: number
    contentPreview: string
    traceabilityIssues: string[]
  }
}

export interface CitationEvidenceView {
  label: string
  sourceHash: string
  documentId?: string
  documentVersion?: string
  sourceTitle?: string
  parserProvider?: string
  chunkId?: string
  vectorId?: string
  pageNumber: number | null
  chunkIndex?: number
  textSpan?: {
    start?: number
    end?: number
  }
  ocrConfidence: number | null
  retrievalScore: number
  contentPreview: string
  traceabilityIssues: string[]
  isTraceable: boolean
}

function isCitationTraceable(citation: ConsumableGroundedCitation): boolean {
  return (
    citation.source.sourceHash.length > 0 &&
    citation.evidence.pageNumber !== null &&
    Number.isFinite(citation.evidence.retrievalScore) &&
    citation.evidence.traceabilityIssues.length === 0
  )
}

export function createCitationEvidenceViews(
  citations: readonly ConsumableGroundedCitation[]
): CitationEvidenceView[] {
  return citations.map((citation) => {
    const view: CitationEvidenceView = {
      label: citation.citationLabel,
      sourceHash: citation.source.sourceHash,
      pageNumber: citation.evidence.pageNumber,
      ocrConfidence: citation.evidence.ocrConfidence,
      retrievalScore: citation.evidence.retrievalScore,
      contentPreview: citation.evidence.contentPreview,
      traceabilityIssues: [...citation.evidence.traceabilityIssues],
      isTraceable: isCitationTraceable(citation),
    }

    if (citation.source.documentId) view.documentId = citation.source.documentId
    if (citation.source.documentVersion) view.documentVersion = citation.source.documentVersion
    if (citation.source.sourceTitle) view.sourceTitle = citation.source.sourceTitle
    if (citation.source.parserProvider) view.parserProvider = citation.source.parserProvider
    if (citation.evidence.chunkId) view.chunkId = citation.evidence.chunkId
    if (citation.evidence.vectorId) view.vectorId = citation.evidence.vectorId
    if (citation.evidence.chunkIndex !== undefined) view.chunkIndex = citation.evidence.chunkIndex
    if (citation.evidence.textSpan) view.textSpan = { ...citation.evidence.textSpan }

    return view
  })
}
