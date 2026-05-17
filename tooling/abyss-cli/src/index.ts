#!/usr/bin/env node

import path from 'path'

import chalk from 'chalk'
import { Command } from 'commander'
import fs from 'fs-extra'
import ora from 'ora'

const program = new Command()

program.name('abyss').description('The Abyss CLI - Monorepo Development Tool').version('0.0.1')

// ============================================
// INIT-TASK COMMAND
// ============================================
program
  .command('init-task <title>')
  .description('Initialize a new task with handoff.md')
  .action(async (title: string) => {
    const spinner = ora('Creating task session...').start()

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 50)
      const sessionDir = path.join(process.cwd(), '.agent/sessions', `session-${timestamp}-${slug}`)

      await fs.ensureDir(sessionDir)

      const templatePath = path.join(process.cwd(), 'docs/templates/handoff.md')
      let resolvedTemplatePath = templatePath
      if (!(await fs.pathExists(templatePath))) {
        resolvedTemplatePath = path.join(process.cwd(), 'docs/templates/HANDOFF.md')
      }

      let template = await fs.readFile(resolvedTemplatePath, 'utf-8')

      template = template
        .replace('[Judul Tugas]', title)
        .replace('[ISO Date]', new Date().toISOString())
        .replace('[Nama Agent]', process.env.USER || 'unknown')
        .replace('[Fase Number]', '1')

      const handoffPath = path.join(sessionDir, 'handoff.md')
      await fs.writeFile(handoffPath, template)

      spinner.succeed(chalk.green(`Task initialized successfully!`))
      console.log()
      console.log(chalk.cyan('Session Path:'))
      console.log(`  ${sessionDir}`)
      console.log()
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
    const spinner = ora('Adding GO approval...').start()

    try {
      let handoffPath = path.join(sessionPath, 'handoff.md')

      if (!(await fs.pathExists(handoffPath))) {
        handoffPath = path.join(sessionPath, 'HANDOFF.md')
        if (!(await fs.pathExists(handoffPath))) {
          throw new Error(`handoff.md not found at ${sessionPath}`)
        }
      }

      let content = await fs.readFile(handoffPath, 'utf-8')
      content = content.replace(/Status:\s*🛑\s*PENDING/i, 'Status: ✅ GO')

      const approvalSection = `
### Approval String
> **Approval:** ✅ GO APPROVED BY CHIEF
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
      spinner.succeed(chalk.green(`GO approval added to ${sessionPath}`))
    } catch (error) {
      spinner.fail(chalk.red('Failed to add GO approval'))
      console.error(error)
      process.exit(1)
    }
  })

// ============================================
// FOCUS COMMAND (ANTI-FORGETTING ENGINE)
// ============================================
program
  .command('focus')
  .description('Show current task context and next steps (The Anti-Forgetting Engine)')
  .action(async () => {
    const spinner = ora('Retrieving focus context...').start()

    try {
      const sessionsPath = path.join(process.cwd(), '.agent/sessions')

      if (!(await fs.pathExists(sessionsPath))) {
        spinner.warn(chalk.yellow('No sessions found.'))
        return
      }

      const sessions = await fs.readdir(sessionsPath)
      const validSessions = sessions
        .filter((s: string) => s.toLowerCase().startsWith('session-'))
        .sort((a: string, b: string) => b.localeCompare(a))

      if (validSessions.length === 0) {
        spinner.warn(chalk.yellow('No valid task sessions found.'))
        return
      }

      const latestSession = validSessions[0]
      const sessionDir = path.join(sessionsPath, latestSession)
      let handoffPath = path.join(sessionDir, 'handoff.md')

      if (!(await fs.pathExists(handoffPath))) {
        handoffPath = path.join(sessionDir, 'HANDOFF.md')
        if (!(await fs.pathExists(handoffPath))) {
          spinner.warn(chalk.yellow(`handoff.md not found in session ${latestSession}`))
          return
        }
      }

      const content = await fs.readFile(handoffPath, 'utf-8')

      spinner.stop()
      console.log()
      console.log(chalk.bold.green('🎯 CURRENT FOCUS: ') + chalk.bold.white(latestSession))
      console.log(chalk.gray('-'.repeat(60)))
      console.log()

      const sections = content.split(/\n## /)

      for (const section of sections) {
        if (section.toLowerCase().includes('diagnosis')) {
          console.log(chalk.cyan('Diagnosis & Context:'))
          console.log(section.split('\n').slice(1).join('\n').trim())
          console.log()
        }
        if (section.toLowerCase().includes('checklist')) {
          console.log(chalk.cyan('Status & Checklist:'))
          const checklistContent = section.split('\n').slice(1).join('\n').split('\n---')[0].trim()
          console.log(checklistContent)
          console.log()
        }
      }

      console.log(chalk.gray('-'.repeat(60)))
      console.log(
        chalk.cyan('Action: ') +
          chalk.white('Edit ') +
          chalk.yellow(path.relative(process.cwd(), handoffPath)) +
          chalk.white(' to update progress.')
      )
      console.log()
    } catch (error) {
      spinner.fail(chalk.red('Failed to retrieve focus context'))
      console.error(error)
    }
  })

// ============================================
// STATUS COMMAND
// ============================================
program
  .command('status')
  .description('Show monorepo health status')
  .action(async () => {
    const spinner = ora('Checking status...').start()

    try {
      console.log()
      console.log(chalk.bold.cyan('🛡️  The Abyss - Monorepo Status'))
      console.log('='.repeat(50))
      console.log()

      const sessionsPath = path.join(process.cwd(), '.agent/sessions')
      let sessionCount = 0
      if (await fs.pathExists(sessionsPath)) {
        const sessions = await fs.readdir(sessionsPath)
        sessionCount = sessions.filter((s: string) => s.toLowerCase().startsWith('session-')).length
      }

      console.log(chalk.cyan('Sessions:'))
      console.log(`  Total: ${sessionCount}`)
      console.log()

      const appsPath = path.join(process.cwd(), 'apps')
      let appCount = 0
      if (await fs.pathExists(appsPath)) {
        const domains = await fs.readdir(appsPath)
        for (const domain of domains) {
          const domainPath = path.join(appsPath, domain)
          const domainStats = await fs.stat(domainPath)
          if (domainStats.isDirectory()) {
            const apps = await fs.readdir(domainPath)
            appCount += apps.length
          }
        }
      }

      console.log(chalk.cyan('Applications:'))
      console.log(`  Total: ${appCount}`)
      console.log()

      const packagesPath = path.join(process.cwd(), 'packages')
      let packageCount = 0
      if (await fs.pathExists(packagesPath)) {
        const packages = await fs.readdir(packagesPath)
        packageCount = packages.length
      }

      console.log(chalk.cyan('Packages:'))
      console.log(`  Total: ${packageCount}`)
      console.log()

      spinner.succeed(chalk.green('Status check complete!'))
    } catch (error) {
      spinner.fail(chalk.red('Failed to check status'))
      console.error(error)
      process.exit(1)
    }
  })

// ============================================
// RUN COMMAND
// ============================================
program.parse()

export { program }
