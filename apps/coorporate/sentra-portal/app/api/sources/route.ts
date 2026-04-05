// Architected and built by Claudesy.

import { readdir, readFile, stat } from 'fs/promises'
import { type NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

const LOGS_DIR = 'D:/Devops/abyss-monorepo/docs/cognitorium/logs'

export interface LogFile {
  id: string
  filename: string
  date: string
  title: string
  size: number
  sizeFormatted: string
}

export interface LogEntry extends LogFile {
  content: string
}

// Parse filename: YYYY-MM-DD-description.md
function parseLogFile(filename: string): { date: string; title: string } | null {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/)
  if (!match) return null

  const [, date, description] = match
  // Convert kebab-case description to readable title
  const title = description
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return { date, title }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// GET /api/sources - List all log files
// GET /api/sources?file=filename.md - Get specific log content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileParam = searchParams.get('file')

    // Return specific file content
    if (fileParam) {
      // Security: prevent directory traversal
      const sanitized = fileParam.replace(/[^a-zA-Z0-9._-]/g, '')
      const filePath = join(LOGS_DIR, sanitized)

      // Ensure it's within the logs directory
      if (!filePath.startsWith(LOGS_DIR)) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
      }

      try {
        const content = await readFile(filePath, 'utf-8')
        const parsed = parseLogFile(sanitized)
        const stats = await stat(filePath)

        return NextResponse.json({
          filename: sanitized,
          date: parsed?.date || '',
          title: parsed?.title || sanitized,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          content,
        } as LogEntry)
      } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
    }

    // List all log files
    const files = await readdir(LOGS_DIR)
    const logFiles: LogFile[] = []

    for (const filename of files) {
      if (!filename.endsWith('.md') || filename === '.gitkeep') continue

      const parsed = parseLogFile(filename)
      if (!parsed) continue

      try {
        const stats = await stat(join(LOGS_DIR, filename))
        logFiles.push({
          id: filename,
          filename,
          date: parsed.date,
          title: parsed.title,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
        })
      } catch {
        // Skip files that can't be stat'd
      }
    }

    // Sort by date descending (newest first)
    logFiles.sort((a, b) => b.date.localeCompare(a.date))

    return NextResponse.json({ logs: logFiles })
  } catch (error) {
    console.error('Error reading logs:', error)
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 })
  }
}
