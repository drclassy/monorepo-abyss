#!/usr/bin/env node

import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'

import chalk from 'chalk'
import { Command } from 'commander'
import fs from 'fs-extra'
import ora from 'ora'

const execFileAsync = promisify(execFile)

const program = new Command()
const REQUIRED_AGENT_FILES = [
  'README.md',
  'CONTEXT.md',
  'DECISIONS.md',
  'HANDOFF.md',
  'PROGRESS.md',
]
const DEFAULT_LOCAL_MODEL = 'gemma2:9b'
const FALLBACK_LOCAL_MODEL = 'granite4.1:3b'
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434'

type AiOptions = {
  ai?: boolean
  model?: string
}

type CommandResult = {
  exitCode: number | string
  stdout: string
  stderr: string
}

type DirtyCategory = 'KEEP' | 'REVIEW' | 'HOLD' | 'RISK'

type DirtyItem = {
  status: string
  file: string
  category: DirtyCategory
}

program
  .name('abyss')
  .description('The Abyss Agent Ops Console')
  .version('0.1.0')
  .option('--repo <path>', 'Repo root override')

function getConfiguredRepoRoot(): string {
  const options = program.opts<{ repo?: string }>()
  return findRepoRoot(options.repo || process.env.INIT_CWD || process.cwd())
}

function findRepoRoot(start: string): string {
  let current = path.resolve(start)

  while (true) {
    const hasWorkspace = fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))
    const hasAgent = fs.existsSync(path.join(current, '.agent'))
    const hasPackage = fs.existsSync(path.join(current, 'package.json'))

    if (hasWorkspace && hasAgent && hasPackage) {
      return current
    }

    const parent = path.dirname(current)
    if (parent === current) {
      return path.resolve(start)
    }
    current = parent
  }
}

function pnpmCommand(): string {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
}

async function runCommand(command: string, args: string[], cwd: string): Promise<CommandResult> {
  const useShell = process.platform === 'win32' && command.toLowerCase().endsWith('.cmd')

  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      env: {
        ...process.env,
        GIT_CONFIG_COUNT: '1',
        GIT_CONFIG_KEY_0: 'safe.directory',
        GIT_CONFIG_VALUE_0: cwd.replace(/\\/g, '/'),
      },
      shell: useShell,
      maxBuffer: 1024 * 1024 * 16,
    })

    return { exitCode: 0, stdout: stdout.toString(), stderr: stderr.toString() }
  } catch (error) {
    const commandError = error as Error & {
      code?: number | string
      stdout?: string | Buffer
      stderr?: string | Buffer
    }

    return {
      exitCode: commandError.code ?? 1,
      stdout: commandError.stdout?.toString() ?? '',
      stderr: commandError.stderr?.toString() ?? commandError.message,
    }
  }
}

async function git(args: string[], cwd: string): Promise<CommandResult> {
  return runCommand('git', args, cwd)
}

async function readTextIfExists(filePath: string): Promise<string> {
  if (!(await fs.pathExists(filePath))) {
    return ''
  }
  return fs.readFile(filePath, 'utf-8')
}

async function getBranch(cwd: string): Promise<string> {
  const result = await git(['branch', '--show-current'], cwd)
  return result.stdout.trim() || 'unknown'
}

async function getDirtyItems(cwd: string): Promise<DirtyItem[]> {
  const result = await git(['status', '--short'], cwd)
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const status = line.slice(0, 2).trim() || line.slice(0, 2)
      const file = line.slice(3).trim()
      return { status, file, category: classifyDirtyPath(status, file) }
    })
}

function classifyDirtyPath(status: string, file: string): DirtyCategory {
  const normalized = file.replace(/\\/g, '/')

  if (
    normalized.includes('.env') ||
    normalized.startsWith('packages/sentra/') ||
    normalized.startsWith('infrastructure/') ||
    normalized === 'pnpm-lock.yaml'
  ) {
    return 'RISK'
  }

  if (
    normalized.startsWith('.codex/') ||
    normalized.startsWith('.cursor/') ||
    normalized.startsWith('apps/corporate/ferdiiskandar/') ||
    normalized.startsWith('.agent/reports/ssot-daily/') ||
    normalized.startsWith('.agent/sessions/')
  ) {
    return 'HOLD'
  }

  if (
    status.includes('D') ||
    normalized.startsWith('docs/archive/') ||
    normalized.startsWith('docs/handbook/')
  ) {
    return 'REVIEW'
  }

  return 'KEEP'
}

function summarizeDirtyItems(items: DirtyItem[]): Record<DirtyCategory, DirtyItem[]> {
  return {
    KEEP: items.filter((item) => item.category === 'KEEP'),
    REVIEW: items.filter((item) => item.category === 'REVIEW'),
    HOLD: items.filter((item) => item.category === 'HOLD'),
    RISK: items.filter((item) => item.category === 'RISK'),
  }
}

async function countDirectories(folderPath: string): Promise<number> {
  if (!(await fs.pathExists(folderPath))) {
    return 0
  }

  const entries = await fs.readdir(folderPath)
  let count = 0
  for (const entry of entries) {
    const stat = await fs.stat(path.join(folderPath, entry))
    if (stat.isDirectory()) {
      count += 1
    }
  }

  return count
}

async function countApps(cwd: string): Promise<number> {
  const appsPath = path.join(cwd, 'apps')
  if (!(await fs.pathExists(appsPath))) {
    return 0
  }

  let appCount = 0
  const domains = await fs.readdir(appsPath)
  for (const domain of domains) {
    const domainPath = path.join(appsPath, domain)
    const domainStats = await fs.stat(domainPath)
    if (!domainStats.isDirectory()) {
      continue
    }

    const apps = await fs.readdir(domainPath)
    for (const app of apps) {
      const appPath = path.join(domainPath, app)
      const appStats = await fs.stat(appPath)
      if (appStats.isDirectory()) {
        appCount += 1
      }
    }
  }

  return appCount
}

async function countSessionLogs(cwd: string): Promise<number> {
  const sessionsPath = path.join(cwd, '.agent', 'sessions')
  if (!(await fs.pathExists(sessionsPath))) {
    return 0
  }

  const entries = await fs.readdir(sessionsPath)
  return entries.filter(
    (entry) => entry.toLowerCase().endsWith('.md') || entry.toLowerCase().startsWith('session-')
  ).length
}

async function runAiSummary(title: string, context: string, options: AiOptions): Promise<void> {
  if (!options.ai) {
    return
  }

  const preferredModel = options.model || process.env.ABYSS_LOCAL_MODEL || DEFAULT_LOCAL_MODEL
  const summary = await askOllama(preferredModel, title, context)
  if (summary.ok) {
    printSection(`AI Summary (${summary.model})`)
    console.log(summary.text)
    return
  }

  if (preferredModel !== FALLBACK_LOCAL_MODEL) {
    const fallback = await askOllama(FALLBACK_LOCAL_MODEL, title, context)
    if (fallback.ok) {
      printSection(`AI Summary (${fallback.model})`)
      console.log(fallback.text)
      return
    }
  }

  printSection('AI Summary')
  console.log(chalk.yellow(`Local model unavailable: ${summary.error}`))
}

async function askOllama(
  model: string,
  title: string,
  context: string
): Promise<
  { ok: true; model: string; text: string } | { ok: false; model: string; error: string }
> {
  const baseUrl = (process.env.ABYSS_OLLAMA_URL || DEFAULT_OLLAMA_URL).replace(/\/$/, '')
  const prompt = [
    'Jawab singkat dalam Bahasa Indonesia untuk Chief.',
    'Data berikut hanya ringkasan operasional lokal. Jangan minta secret, jangan bahas .env, PHI, patient data, atau isi proprietary.',
    'Berikan maksimal 5 bullet praktis dan exactly one recommended next step.',
    '',
    `Judul: ${title}`,
    '',
    context.slice(0, 12000),
  ].join('\n')

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.1 },
      }),
      signal: AbortSignal.timeout(90000),
    })

    if (!response.ok) {
      return { ok: false, model, error: `Ollama HTTP ${response.status}` }
    }

    const data = (await response.json()) as { response?: string; error?: string }
    if (data.error) {
      return { ok: false, model, error: data.error }
    }

    return { ok: true, model, text: (data.response || '').trim() || '(empty response)' }
  } catch (error) {
    return { ok: false, model, error: error instanceof Error ? error.message : String(error) }
  }
}

function printHeader(title: string): void {
  console.log()
  console.log(chalk.bold.cyan(title))
  console.log('='.repeat(60))
}

function printSection(title: string): void {
  console.log()
  console.log(chalk.bold(title))
  console.log('-'.repeat(60))
}

function printKeyValue(label: string, value: string | number): void {
  console.log(`${chalk.cyan(label.padEnd(18))} ${value}`)
}

function extractBullets(content: string, heading: string): string[] {
  const headingPattern = new RegExp(`^## ${heading}\\s*$`, 'im')
  const match = headingPattern.exec(content)
  if (!match) {
    return []
  }

  const rest = content.slice(match.index + match[0].length)
  const nextHeading = rest.search(/^## /m)
  const section = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest

  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2))
}

// ============================================
// INIT-TASK COMMAND
// ============================================
program
  .command('init-task <title>')
  .description('Initialize a new task with handoff.md')
  .action(async (title: string) => {
    const repoRoot = getConfiguredRepoRoot()
    const spinner = ora('Creating task session...').start()

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 50)
      const sessionDir = path.join(repoRoot, '.agent', 'sessions', `session-${timestamp}-${slug}`)

      await fs.ensureDir(sessionDir)

      const candidateTemplates = [
        path.join(repoRoot, 'docs', 'templates', 'handoff.md'),
        path.join(repoRoot, 'docs', 'templates', '001-handoff.md'),
        path.join(repoRoot, 'docs', 'templates', 'HANDOFF.md'),
      ]
      const resolvedTemplatePath = candidateTemplates.find((candidate) => fs.existsSync(candidate))

      if (!resolvedTemplatePath) {
        throw new Error('No handoff template found in docs/templates')
      }

      let template = await fs.readFile(resolvedTemplatePath, 'utf-8')
      template = template
        .replace('[Judul Tugas]', title)
        .replace('[ISO Date]', new Date().toISOString())
        .replace('[Nama Agent]', process.env.USER || process.env.USERNAME || 'unknown')
        .replace('[Fase Number]', '1')

      const handoffPath = path.join(sessionDir, 'handoff.md')
      await fs.writeFile(handoffPath, template)

      spinner.succeed(chalk.green('Task initialized successfully!'))
      console.log()
      printKeyValue('Session Path:', sessionDir)
    } catch (error) {
      spinner.fail(chalk.red('Failed to initialize task'))
      console.error(error)
      process.exit(1)
    }
  })

// ============================================
// GO COMMAND (CHIEF APPROVAL)
// ============================================
program
  .command('go <sessionPath>')
  .description('Add GO approval to a handoff.md')
  .option('-b, --by <name>', 'Approver name')
  .option('-c, --comments <text>', 'Approval comments')
  .action(async (sessionPath: string, options: { by?: string; comments?: string }) => {
    const repoRoot = getConfiguredRepoRoot()
    const spinner = ora('Adding GO approval...').start()

    try {
      const resolvedSessionPath = path.isAbsolute(sessionPath)
        ? sessionPath
        : path.join(repoRoot, sessionPath)
      let handoffPath = path.join(resolvedSessionPath, 'handoff.md')

      if (!(await fs.pathExists(handoffPath))) {
        handoffPath = path.join(resolvedSessionPath, 'HANDOFF.md')
        if (!(await fs.pathExists(handoffPath))) {
          throw new Error(`handoff.md not found at ${resolvedSessionPath}`)
        }
      }

      let content = await fs.readFile(handoffPath, 'utf-8')
      content = content.replace(/Status:\s*.+?\s*PENDING/i, 'Status: GO')

      const approvalSection = `
### Approval String
> **Approval:** GO APPROVED BY CHIEF
> **Approved By:** ${options.by || 'Chief'}
> **Approved At:** ${new Date().toISOString()}
> **Comments:** ${options.comments || 'None'}
`

      if (content.toLowerCase().includes('### approval string')) {
        content = content.replace(
          /### Approval String\s*\n>.*?(?=\n\n|\n##|$)/is,
          approvalSection.trim()
        )
      } else {
        content += `\n\n${approvalSection}`
      }

      await fs.writeFile(handoffPath, content)
      spinner.succeed(chalk.green(`GO approval added to ${path.relative(repoRoot, handoffPath)}`))
    } catch (error) {
      spinner.fail(chalk.red('Failed to add GO approval'))
      console.error(error)
      process.exit(1)
    }
  })

// ============================================
// FOCUS COMMAND
// ============================================
program
  .command('focus')
  .description('Show current .agent handoff and next actions')
  .option('--ai', 'Summarize with local Ollama model')
  .option('--model <name>', 'Ollama model override')
  .action(async (options: AiOptions) => {
    const repoRoot = getConfiguredRepoRoot()
    const handoffPath = path.join(repoRoot, '.agent', 'HANDOFF.md')
    const progressPath = path.join(repoRoot, '.agent', 'PROGRESS.md')
    const handoff = await readTextIfExists(handoffPath)
    const progress = await readTextIfExists(progressPath)

    printHeader('ABYSS Focus')
    printKeyValue('Repo:', repoRoot)
    printKeyValue('Handoff:', path.relative(repoRoot, handoffPath))

    if (!handoff) {
      console.log(chalk.red('Missing .agent/HANDOFF.md'))
      process.exitCode = 1
      return
    }

    const technicalState = extractBullets(handoff, 'Current Technical State')
    const followUp = extractBullets(handoff, 'Remaining Follow-Up')

    printSection('Current Technical State')
    for (const item of technicalState.slice(0, 8)) {
      console.log(`- ${item}`)
    }

    printSection('Remaining Follow-Up')
    for (const item of followUp.slice(0, 8)) {
      console.log(`- ${item}`)
    }

    const aiContext = [
      'HANDOFF current technical state:',
      ...technicalState.map((item) => `- ${item}`),
      '',
      'HANDOFF remaining follow-up:',
      ...followUp.map((item) => `- ${item}`),
      '',
      'PROGRESS excerpt:',
      progress.slice(0, 3000),
    ].join('\n')
    await runAiSummary('ABYSS focus from .agent SSOT', aiContext, options)
  })

// ============================================
// STATUS COMMAND
// ============================================
program
  .command('status')
  .description('Show repo, SSOT, package, and dirty tree status')
  .option('--ai', 'Summarize with local Ollama model')
  .option('--model <name>', 'Ollama model override')
  .action(async (options: AiOptions) => {
    const repoRoot = getConfiguredRepoRoot()
    const branch = await getBranch(repoRoot)
    const dirtyItems = await getDirtyItems(repoRoot)
    const dirtySummary = summarizeDirtyItems(dirtyItems)

    printHeader('The Abyss - Agent Ops Status')
    printKeyValue('Repo:', repoRoot)
    printKeyValue('Branch:', branch)
    printKeyValue('Apps:', await countApps(repoRoot))
    printKeyValue('Top packages:', await countDirectories(path.join(repoRoot, 'packages')))
    printKeyValue('Session logs:', await countSessionLogs(repoRoot))
    printKeyValue('Dirty files:', dirtyItems.length)
    printKeyValue('KEEP:', dirtySummary.KEEP.length)
    printKeyValue('REVIEW:', dirtySummary.REVIEW.length)
    printKeyValue('HOLD:', dirtySummary.HOLD.length)
    printKeyValue('RISK:', dirtySummary.RISK.length)

    const modelList = await runCommand('ollama', ['list'], repoRoot)
    if (modelList.exitCode === 0) {
      const hasGemma = modelList.stdout.includes(DEFAULT_LOCAL_MODEL)
      printKeyValue(
        'Local model:',
        hasGemma ? `${DEFAULT_LOCAL_MODEL} ready` : `${DEFAULT_LOCAL_MODEL} missing`
      )
    }

    await runAiSummary(
      'ABYSS ops status',
      [
        `branch=${branch}`,
        `dirty=${dirtyItems.length}`,
        `KEEP=${dirtySummary.KEEP.length}`,
        `REVIEW=${dirtySummary.REVIEW.length}`,
        `HOLD=${dirtySummary.HOLD.length}`,
        `RISK=${dirtySummary.RISK.length}`,
        'Top dirty samples:',
        ...dirtyItems.slice(0, 40).map((item) => `${item.category} ${item.status} ${item.file}`),
      ].join('\n'),
      options
    )
  })

// ============================================
// CHANGED COMMAND
// ============================================
program
  .command('changed')
  .description('Classify dirty tree into KEEP, REVIEW, HOLD, and RISK')
  .option('--ai', 'Summarize with local Ollama model')
  .option('--model <name>', 'Ollama model override')
  .action(async (options: AiOptions) => {
    const repoRoot = getConfiguredRepoRoot()
    const dirtyItems = await getDirtyItems(repoRoot)
    const groups = summarizeDirtyItems(dirtyItems)

    printHeader('ABYSS Dirty Tree Classification')
    printKeyValue('Dirty files:', dirtyItems.length)

    for (const category of ['RISK', 'HOLD', 'REVIEW', 'KEEP'] as DirtyCategory[]) {
      const items = groups[category]
      printSection(`${category} (${items.length})`)
      for (const item of items.slice(0, 25)) {
        console.log(`${item.status.padEnd(3)} ${item.file}`)
      }
      if (items.length > 25) {
        console.log(chalk.gray(`... ${items.length - 25} more`))
      }
    }

    await runAiSummary(
      'ABYSS dirty tree classification',
      dirtyItems.map((item) => `${item.category} ${item.status} ${item.file}`).join('\n'),
      options
    )
  })

// ============================================
// DOCTOR COMMAND
// ============================================
program
  .command('doctor')
  .description('Run deterministic governance and local model readiness checks')
  .option('--ai', 'Summarize with local Ollama model')
  .option('--model <name>', 'Ollama model override')
  .action(async (options: AiOptions) => {
    const repoRoot = getConfiguredRepoRoot()
    const missingAgentFiles = REQUIRED_AGENT_FILES.filter(
      (fileName) => !fs.existsSync(path.join(repoRoot, '.agent', fileName))
    )
    const governance = await runCommand(pnpmCommand(), ['governance:agents-check'], repoRoot)
    const modelList = await runCommand('ollama', ['list'], repoRoot)

    printHeader('ABYSS Doctor')
    printKeyValue(
      '.agent files:',
      missingAgentFiles.length === 0 ? 'PASS' : `MISSING ${missingAgentFiles.join(', ')}`
    )
    printKeyValue(
      'Governance:',
      governance.exitCode === 0 ? 'PASS' : `FAIL (${governance.exitCode})`
    )
    printKeyValue('Ollama:', modelList.exitCode === 0 ? 'PASS' : `FAIL (${modelList.exitCode})`)
    if (modelList.exitCode === 0) {
      printKeyValue(
        DEFAULT_LOCAL_MODEL,
        modelList.stdout.includes(DEFAULT_LOCAL_MODEL) ? 'READY' : 'MISSING'
      )
      printKeyValue(
        FALLBACK_LOCAL_MODEL,
        modelList.stdout.includes(FALLBACK_LOCAL_MODEL) ? 'READY' : 'MISSING'
      )
    }

    if (governance.exitCode !== 0) {
      printSection('Governance Output')
      console.log((governance.stdout || governance.stderr).trim())
      process.exitCode = 1
    }

    await runAiSummary(
      'ABYSS doctor',
      [
        `.agent missing=${missingAgentFiles.join(', ') || 'none'}`,
        `governance exit=${governance.exitCode}`,
        `ollama exit=${modelList.exitCode}`,
        'ollama models:',
        modelList.stdout,
      ].join('\n'),
      options
    )
  })

program.parse()

export { program }
