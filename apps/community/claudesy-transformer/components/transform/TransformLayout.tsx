// Claudesy CTE V2 — Main transform layout (composition component)

"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TransformForm } from "./TransformForm"
import { TransformOutput } from "./TransformOutput"
import { PromptPresets } from "./PromptPresets"
import { PromptHistory } from "./PromptHistory"
import { useTransform } from "@/hooks/use-transform"
import { usePromptHistory } from "@/hooks/use-prompt-history"
import type { TransformRequest, HistoryItem } from "@/lib/schemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TransformRequestSchema } from "@/lib/schemas"

export function TransformLayout() {
  const { transform, result, isLoading } = useTransform()
  const { history, addItem, removeItem, toggleStarItem, clearAll } =
    usePromptHistory()

  const form = useForm<TransformRequest>({
    resolver: zodResolver(TransformRequestSchema),
    defaultValues: {
      prompt: "",
      model: "claude-sonnet",
      mode: "professional",
      temperature: 0.7,
      maxTokens: 1024,
      locale: "id",
    },
  })

  const handleSubmit = useCallback(
    async (data: TransformRequest) => {
      await transform(data)
    },
    [transform]
  )

  const handlePresetSelect = useCallback(
    (values: Partial<TransformRequest>) => {
      if (values.prompt) form.setValue("prompt", values.prompt)
      if (values.model) form.setValue("model", values.model)
      if (values.mode) form.setValue("mode", values.mode)
      toast.info("Preset dimuat ke form")
    },
    [form]
  )

  const handleSaveToHistory = useCallback(() => {
    if (!result) return
    const historyItem: HistoryItem = {
      id: result.id,
      originalPrompt: result.originalPrompt,
      transformedPrompt: result.transformedPrompt,
      model: result.model,
      mode: result.mode,
      createdAt: result.metadata.transformedAt,
      starred: false,
    }
    addItem(historyItem)
    toast.success("Disimpan ke riwayat")
  }, [result, addItem])

  const handleLoadFromHistory = useCallback(
    (values: Partial<TransformRequest>) => {
      if (values.prompt) form.setValue("prompt", values.prompt)
      if (values.model) form.setValue("model", values.model)
      if (values.mode) form.setValue("mode", values.mode)
      toast.info("Prompt dimuat dari riwayat")
    },
    [form]
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Desktop: two columns */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Left: Form + Presets */}
        <div className="space-y-6">
          <TransformForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            defaultValues={form.getValues()}
          />
          <PromptPresets onSelectPreset={handlePresetSelect} />
        </div>

        {/* Right: Output + History */}
        <div className="space-y-6">
          <TransformOutput
            result={result}
            isLoading={isLoading}
            onSaveToHistory={handleSaveToHistory}
          />
          <PromptHistory
            history={history}
            onLoadPrompt={handleLoadFromHistory}
            onToggleStar={toggleStarItem}
            onRemove={removeItem}
            onClearAll={clearAll}
          />
        </div>
      </div>

      {/* Mobile: stacked with tabs */}
      <div className="lg:hidden space-y-6">
        <TransformForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          defaultValues={form.getValues()}
        />

        <Tabs defaultValue="output" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="output"
              className="font-mono text-xs data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Output
            </TabsTrigger>
            <TabsTrigger
              value="presets"
              className="font-mono text-xs data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Presets
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="font-mono text-xs data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Riwayat
            </TabsTrigger>
          </TabsList>
          <TabsContent value="output" className="mt-4">
            <TransformOutput
              result={result}
              isLoading={isLoading}
              onSaveToHistory={handleSaveToHistory}
            />
          </TabsContent>
          <TabsContent value="presets" className="mt-4">
            <PromptPresets onSelectPreset={handlePresetSelect} />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <PromptHistory
              history={history}
              onLoadPrompt={handleLoadFromHistory}
              onToggleStar={toggleStarItem}
              onRemove={removeItem}
              onClearAll={clearAll}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
