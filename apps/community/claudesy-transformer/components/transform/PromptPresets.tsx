// Claudesy CTE V2 — Preset prompt selector

"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PRESETS, CATEGORY_LABELS, MODELS } from "@/lib/constants"
import type { PromptPreset } from "@/lib/constants"
import type { TransformRequest } from "@/lib/schemas"

interface PromptPresetsProps {
  onSelectPreset: (values: Partial<TransformRequest>) => void
}

export function PromptPresets({ onSelectPreset }: PromptPresetsProps) {
  const [activeCategory, setActiveCategory] = useState<string>("content-creator")

  const categories = Object.entries(CATEGORY_LABELS) as [
    PromptPreset["category"],
    string,
  ][]

  const filteredPresets = PRESETS.filter((p) => p.category === activeCategory)

  function handleSelect(preset: PromptPreset) {
    onSelectPreset({
      prompt: preset.prompt,
      model: preset.model,
      mode: preset.mode,
    })
  }

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-xs font-bold tracking-wider text-gray-500">
        CONTOH PROMPT & PRESETS
      </h3>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          {categories.map(([key, label]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="px-2 py-1.5 font-mono text-[10px] data-[state=active]:bg-black data-[state=active]:text-white"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(([key]) => (
          <TabsContent key={key} value={key} className="mt-3">
            <div className="grid gap-2">
              {filteredPresets.map((preset) => {
                const modelInfo = MODELS.find((m) => m.id === preset.model)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelect(preset)}
                    className="group w-full rounded-lg border-2 border-gray-200 p-3 text-left transition-all hover:border-black hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-mono text-sm font-bold group-hover:text-black">
                          {preset.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 gap-1">
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px]"
                        >
                          {modelInfo?.name ?? preset.model}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px]"
                        >
                          {preset.mode}
                        </Badge>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
