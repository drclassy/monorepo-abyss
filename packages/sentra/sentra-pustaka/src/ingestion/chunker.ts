// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
export interface Chunk {
  content: string
  headingPath: string[]
  index: number
  tokenCount: number
}

const MIN_TOKENS = 100
const MAX_TOKENS = 800
const WORDS_PER_TOKEN = 0.75

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length / WORDS_PER_TOKEN)
}

function parseHeadings(text: string): Array<{ level: number; title: string; content: string }> {
  const sections: Array<{ level: number; title: string; content: string }> = []
  const lines = text.split('\n')
  let currentSection = { level: 0, title: 'Document', content: '' }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      if (currentSection.content.trim()) sections.push({ ...currentSection })
      currentSection = {
        level: headingMatch[1].length,
        title: headingMatch[2].trim(),
        content: '',
      }
    } else {
      currentSection.content += line + '\n'
    }
  }
  if (currentSection.content.trim()) sections.push(currentSection)
  return sections
}

export function chunkText(text: string): Chunk[] {
  const sections = parseHeadings(text)
  const chunks: Chunk[] = []
  const headingStack: string[] = []
  let index = 0

  for (const section of sections) {
    headingStack.splice(section.level - 1)
    headingStack[section.level - 1] = section.title
    const path = headingStack.filter(Boolean)

    const tokens = estimateTokens(section.content)

    if (tokens < MIN_TOKENS) {
      // Merge small chunks with heading as context
      const merged = `${path.join(' > ')}\n\n${section.content.trim()}`
      if (merged.trim().length > 20) {
        chunks.push({ content: merged, headingPath: path, index: index++, tokenCount: estimateTokens(merged) })
      }
    } else if (tokens > MAX_TOKENS) {
      // Split by double newline first; if that yields no useful splits, fall back to line groups
      let paragraphs = section.content.split(/\n\n+/).filter(p => p.trim().length > 20)
      if (paragraphs.length <= 1) {
        // No double newlines — PDF plain text. Group lines into token-sized chunks.
        const lines = section.content.split('\n').filter(l => l.trim().length > 0)
        paragraphs = []
        let group: string[] = []
        let groupTokens = 0
        for (const line of lines) {
          const lt = estimateTokens(line)
          if (groupTokens + lt > MAX_TOKENS && group.length > 0) {
            paragraphs.push(group.join('\n'))
            group = [line]
            groupTokens = lt
          } else {
            group.push(line)
            groupTokens += lt
          }
        }
        if (group.length > 0) paragraphs.push(group.join('\n'))
      }

      const prefix = path.length > 0 ? `${path.join(' > ')}\n\n` : ''
      let buffer = prefix
      let bufTokens = estimateTokens(buffer)

      for (const para of paragraphs) {
        const paraTokens = estimateTokens(para)
        if (bufTokens + paraTokens > MAX_TOKENS && bufTokens > MIN_TOKENS) {
          chunks.push({ content: buffer.trim(), headingPath: path, index: index++, tokenCount: bufTokens })
          buffer = prefix + para + '\n\n'
          bufTokens = estimateTokens(buffer)
        } else {
          buffer += para + '\n\n'
          bufTokens += paraTokens
        }
      }
      if (buffer.trim().length > 20) {
        chunks.push({ content: buffer.trim(), headingPath: path, index: index++, tokenCount: estimateTokens(buffer) })
      }
    } else {
      const content = `${path.join(' > ')}\n\n${section.content.trim()}`
      chunks.push({ content, headingPath: path, index: index++, tokenCount: tokens })
    }
  }

  return chunks
}
