// Claudesy CTE V2 — Prompt history panel

"use client"

import { Star, Trash2, RotateCcw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { HistoryItem } from "@/lib/schemas"
import type { TransformRequest } from "@/lib/schemas"

interface PromptHistoryProps {
  history: HistoryItem[]
  onLoadPrompt: (values: Partial<TransformRequest>) => void
  onToggleStar: (id: string) => void
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function PromptHistory({
  history,
  onLoadPrompt,
  onToggleStar,
  onRemove,
  onClearAll,
}: PromptHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <Clock className="mb-3 h-10 w-10 text-gray-300" />
        <h3 className="font-mono text-sm font-bold text-gray-400">
          BELUM ADA RIWAYAT
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          Prompt yang ditransformasi akan muncul di sini
        </p>
      </div>
    )
  }

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-bold tracking-wider text-gray-500">
          RIWAYAT ({history.length})
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-700">
              Hapus Semua
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Semua Riwayat?</DialogTitle>
              <DialogDescription>
                Tindakan ini tidak dapat dibatalkan. Semua riwayat prompt akan dihapus.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive" onClick={onClearAll}>
                Ya, Hapus Semua
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[350px]">
        <div className="space-y-2 pr-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="group rounded-lg border-2 border-gray-200 p-3 transition-all hover:border-gray-400"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs line-clamp-2 text-gray-700">
                    {item.originalPrompt}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[9px]">
                      {item.model}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[9px]">
                      {item.mode}
                    </Badge>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    onLoadPrompt({
                      prompt: item.originalPrompt,
                      model: item.model,
                      mode: item.mode,
                    })
                  }
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Muat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onToggleStar(item.id)}
                >
                  <Star
                    className={`h-3 w-3 mr-1 ${
                      item.starred ? "fill-yellow-400 text-yellow-400" : ""
                    }`}
                  />
                  {item.starred ? "Batal" : "Tandai"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
