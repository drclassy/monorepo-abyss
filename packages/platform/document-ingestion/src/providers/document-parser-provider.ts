import type { CanonicalDocument, ParseInput } from '../types'

export interface DocumentParserProvider {
  name: 'liteparse'
  parse(input: ParseInput): Promise<CanonicalDocument>
}
