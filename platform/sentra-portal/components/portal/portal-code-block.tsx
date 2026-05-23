'use client'

import type { ReactNode } from 'react'

const JS_KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'await',
  'fetch',
  'return',
  'import',
  'from',
  'new',
  'async',
  'console',
  'typeof',
  'if',
  'else',
])

const PS_KEYWORDS = new Set(['pnpm'])

type TokenKind = 'plain' | 'keyword' | 'string' | 'comment' | 'fn' | 'num' | 'env' | 'flag'

const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: 'text-zinc-300',
  keyword: 'text-[#e5a84b]',
  string: 'text-[#7ee787]',
  comment: 'text-zinc-500',
  fn: 'text-[#79c0ff]',
  num: 'text-[#ffa657]',
  env: 'text-[#d2a8ff]',
  flag: 'text-[#a5d6ff]',
}

function span(kind: TokenKind, text: string, key: number) {
  return (
    <span key={key} className={TOKEN_CLASS[kind]}>
      {text}
    </span>
  )
}

function highlightJavaScriptLine(line: string, keyBase: number): ReactNode[] {
  const out: ReactNode[] = []
  const commentMatch = line.match(/^(\s*)(\/\/.*)$/)
  if (commentMatch) {
    if (commentMatch[1]) out.push(span('plain', commentMatch[1], keyBase))
    out.push(span('comment', commentMatch[2] ?? '', keyBase + 1))
    return out
  }

  const re =
    /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(\b(?:const|let|var|await|fetch|return|import|from|new|async|console|typeof|if|else)\b)|(\b\d+\b)|(\.[a-zA-Z_$][\w$]*)|(\b[a-zA-Z_$][\w$]*)(?=\s*\()|(\b[a-zA-Z_$][\w$]*)/g

  let last = 0
  let k = keyBase
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(span('plain', line.slice(last, m.index), k++))
    const [full, str, kw, num, dot, fn, ident] = m
    if (str) out.push(span('string', full, k++))
    else if (kw) out.push(span('keyword', full, k++))
    else if (num) out.push(span('num', full, k++))
    else if (dot) out.push(span('plain', full, k++))
    else if (fn) out.push(span('fn', full, k++))
    else if (ident) {
      const kind = JS_KEYWORDS.has(ident) ? 'keyword' : 'plain'
      out.push(span(kind, full, k++))
    }
    last = m.index + full.length
  }
  if (last < line.length) out.push(span('plain', line.slice(last), k++))
  return out
}

function highlightPowerShellLine(line: string, keyBase: number): ReactNode[] {
  const out: ReactNode[] = []
  const trimmed = line.trimStart()
  if (trimmed.startsWith('#')) {
    return [span('comment', line, keyBase)]
  }

  const re =
    /(\$[a-zA-Z_:][\w:]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(--[\w-]+)|(\bpnpm\b)|(\bawait\b)|(\bfetch\b)|(\b[a-zA-Z_$][\w$]*)(?=\s*\()|(\b[a-zA-Z_$][\w$]*)/g

  let last = 0
  let k = keyBase
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(span('plain', line.slice(last, m.index), k++))
    const [full, env, str, flag, psKw, kwAwait, kwFetch, fn, ident] = m
    if (env) out.push(span('env', full, k++))
    else if (str) out.push(span('string', full, k++))
    else if (flag) out.push(span('flag', full, k++))
    else if (psKw) out.push(span('keyword', full, k++))
    else if (kwAwait || kwFetch) out.push(span('keyword', full, k++))
    else if (fn) out.push(span('fn', full, k++))
    else if (ident) {
      const kind = PS_KEYWORDS.has(ident) ? 'keyword' : 'plain'
      out.push(span(kind, full, k++))
    }
    last = m.index + full.length
  }
  if (last < line.length) out.push(span('plain', line.slice(last), k++))
  return out
}

function highlightLine(
  line: string,
  language: 'javascript' | 'mixed',
  keyBase: number
): ReactNode[] {
  if (language === 'mixed') {
    const t = line.trimStart()
    if (t.startsWith('$') || t.startsWith('#') || t.startsWith('pnpm')) {
      return highlightPowerShellLine(line, keyBase)
    }
  }
  return highlightJavaScriptLine(line, keyBase)
}

export function PortalCodeBlock({
  code,
  language,
}: {
  code: string
  language: 'javascript' | 'powershell' | 'mixed'
}) {
  const lang = language === 'powershell' ? 'mixed' : language
  const lines = code.split('\n')

  return (
    <pre className="overflow-x-auto rounded-lg bg-[#161618] p-4 text-[12px] leading-relaxed">
      <code className="font-mono">
        {lines.map((line, i) => (
          <span key={i} className="block">
            {highlightLine(line, lang, i * 1000)}
            {i < lines.length - 1 ? '\n' : null}
          </span>
        ))}
      </code>
    </pre>
  )
}
