export type IngestionErrorCode =
  | 'FILE_NOT_FOUND'
  | 'FILE_READ_ERROR'
  | 'PARSE_ERROR'
  | 'PREFLIGHT_ERROR'
  | 'NORMALIZATION_ERROR'
  | 'NO_INPUT'

export class IngestionError extends Error {
  readonly code: IngestionErrorCode
  readonly cause?: unknown

  constructor(message: string, code: IngestionErrorCode, cause?: unknown) {
    super(message)
    this.name = 'IngestionError'
    this.code = code
    this.cause = cause
  }
}
