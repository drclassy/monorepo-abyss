const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const projectRoot = path.resolve(__dirname, '..')
const docsFeaturesDir = path.join(projectRoot, 'docs', 'features')

const COMMIT_REGEX = /^(feat|fix)(\([^)]+\))?!?:\s*(.+)$/i

function getCommitHistory() {
  try {
    const output = execSync(
      'git log --pretty=format:"%H%x1f%s%x1f%b%x1e" -E --grep="^(feat|fix)"',
      { cwd: projectRoot, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    )
    if (!output.trim()) return []
    return output
      .split('\x1e')
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const [hash, subject, body] = block.split('\x1f')
        return {
          hash: (hash || '').trim(),
          subject: (subject || '').trim(),
          body: (body || '').trim(),
        }
      })
  } catch (err) {
    console.error('[functional-docs] git log failed:', err.message)
    return []
  }
}

function parseCommit(commit) {
  const match = commit.subject.match(COMMIT_REGEX)
  if (!match) return null
  const [, type, scopeRaw, description] = match
  const scope = scopeRaw ? scopeRaw.replace(/^\(|\)$/g, '') : null
  return {
    hash: commit.hash,
    type: type.toLowerCase(),
    scope,
    description: description.trim(),
    body: commit.body,
  }
}

function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'unnamed'
  )
}

function writeFeatureDoc(parsed) {
  const slug = (parsed.scope ? parsed.scope + '-' : '') + slugify(parsed.description)
  const filename = `${parsed.type}-${slug}-${parsed.hash.slice(0, 7)}.md`
  const outputPath = path.join(docsFeaturesDir, filename)

  const content = [
    `# ${parsed.type.toUpperCase()}: ${parsed.description}`,
    '',
    `**Commit:** \`${parsed.hash.slice(0, 7)}\``,
    parsed.scope ? `**Scope:** \`${parsed.scope}\`` : null,
    '',
    parsed.body ? '## Details\n\n' + parsed.body : '## Details\n\n_No additional commit body._',
    '',
  ]
    .filter((line) => line !== null)
    .join('\n')

  fs.writeFileSync(outputPath, content, 'utf8')
  return outputPath
}

function main() {
  console.log('[functional-docs] Generating functional feature documentation...')
  fs.mkdirSync(docsFeaturesDir, { recursive: true })

  const commits = getCommitHistory()
  console.log(`[functional-docs] Found ${commits.length} feat/fix commits.`)

  let generated = 0
  for (const commit of commits) {
    const parsed = parseCommit(commit)
    if (parsed) {
      writeFeatureDoc(parsed)
      generated += 1
    }
  }

  console.log(`[functional-docs] Generated ${generated} feature docs.`)
}

main()
