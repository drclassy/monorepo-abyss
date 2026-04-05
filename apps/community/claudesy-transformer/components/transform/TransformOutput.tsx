// Claudesy CTE V2 — Transform output display

"use client"

import { Sparkles, Save, Clock, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/shared/CopyButton"
import type { TransformResponse } from "@/lib/schemas"

interface TransformOutputProps {
  result: TransformResponse | null
  isLoading: boolean
  onSaveToHistory: () => void
}

export function TransformOutput({
  result,
  isLoading,
  onSaveToHistory,
}: TransformOutputProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border-2 border-gray-200 p-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <span className="font-mono text-sm">TRANSFORMING...</span>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-gray-300" />
        <h3 className="font-mono text-sm font-bold text-gray-400">
          SUPER PROMPT AKAN MUNCUL DI SINI
        </h3>
        <p className="mt-2 text-sm text-gray-400">
          Masukkan prompt mentah dan klik Transform
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-bold tracking-wider text-gray-500">
            SUPER PROMPT
          </h3>
          <Badge variant="outline" className="font-mono text-[10px]">
            {result.model}
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px]">
            {result.mode}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={result.transformedPrompt} />
          <Button variant="outline" size="sm" onClick={onSaveToHistory}>
            <Save className="h-4 w-4 mr-1" />
            Simpan
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] rounded-lg border-2 border-black bg-gray-50 p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {result.transformedPrompt}
        </pre>
      </ScrollArea>

      <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
        <span className="flex items-center gap-1">
          <Hash className="h-3 w-3" />
          ~{result.metadata.tokensEstimate} tokens
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {result.metadata.processingTimeMs}ms
        </span>
      </div>
    </div>
  )
}
