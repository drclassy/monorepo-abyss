import type { CanonicalDocument, ParseInput } from '../types'

export interface DocumentParserProvider {
  name: 'liteparse' | 'jats-xml'
  parse(input: ParseInput): Promise<CanonicalDocument>
}
