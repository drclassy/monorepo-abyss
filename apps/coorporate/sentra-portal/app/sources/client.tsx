// Architected and built by Claudesy.

'use client'

import { Calendar, ChevronRight, FileText, HardDrive, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface LogFile {
  id: string
  filename: string
  date: string
  title: string
  size: number
  sizeFormatted: string
}

interface LogEntry extends LogFile {
  content: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface LogViewerClientProps {
  logs: LogFile[]
  initialSelectedLog: LogEntry | null
}

export function LogViewerClient({ logs, initialSelectedLog }: LogViewerClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(initialSelectedLog)
  const [isLoading, setIsLoading] = useState(false)

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs

    const query = searchQuery.toLowerCase()
    return logs.filter(
      log =>
        log.title.toLowerCase().includes(query) ||
        log.date.includes(query) ||
        log.filename.toLowerCase().includes(query)
    )
  }, [logs, searchQuery])

  const handleSelectLog = async (log: LogFile) => {
    if (selectedLog?.filename === log.filename) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/sources?file=${encodeURIComponent(log.filename)}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedLog(data)
        // Update URL without navigation
        const url = new URL(window.location.href)
        url.searchParams.set('file', log.filename)
        window.history.replaceState({}, '', url.toString())
      }
    } catch (error) {
      console.error('Failed to load log:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Panel - File List */}
      <Card className="flex w-96 flex-col border-neutral-800 bg-neutral-900">
        <CardHeader className="border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-200">
              <HardDrive className="h-5 w-5 text-neutral-400" />
              Log Files
            </CardTitle>
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
              {filteredLogs.length}
            </span>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="border-neutral-800 bg-neutral-950 pl-9 pr-9 text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-neutral-700"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-14rem)]">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-neutral-500">
                <Search className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">No logs found</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {filteredLogs.map(log => (
                  <button
                    key={log.id}
                    onClick={() => handleSelectLog(log)}
                    className={cn(
                      'w-full p-4 text-left transition-colors hover:bg-neutral-800/50',
                      selectedLog?.filename === log.filename ? 'bg-neutral-800' : ''
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <FileText
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          selectedLog?.filename === log.filename
                            ? 'text-neutral-300'
                            : 'text-neutral-500'
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'truncate text-sm font-medium',
                            selectedLog?.filename === log.filename
                              ? 'text-neutral-200'
                              : 'text-neutral-300'
                          )}
                        >
                          {log.title}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(log.date)}
                          </span>
                          <span>{log.sizeFormatted}</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 shrink-0 text-neutral-600',
                          selectedLog?.filename === log.filename ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - Content Preview */}
      <Card className="flex flex-1 flex-col border-neutral-800 bg-neutral-900">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
          </div>
        ) : selectedLog ? (
          <>
            <CardHeader className="border-b border-neutral-800">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-xl font-semibold text-neutral-200">
                    {selectedLog.title}
                  </CardTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedLog.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="h-4 w-4" />
                      {selectedLog.sizeFormatted}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{selectedLog.filename}</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-neutral-300">
                    {selectedLog.content}
                  </pre>
                </div>
              </ScrollArea>
            </CardContent>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-neutral-500">
            <FileText className="mb-4 h-16 w-16 opacity-20" />
            <p className="text-lg font-medium">Select a log file to view</p>
            <p className="text-sm">Click on any file from the list to view its contents</p>
          </div>
        )}
      </Card>
    </div>
  )
}
