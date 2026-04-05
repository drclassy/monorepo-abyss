// Claudesy CTE V2 — Model settings (temperature, max tokens)

"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface ModelSettingsProps {
  temperature: number
  maxTokens: number
  onTemperatureChange: (value: number) => void
  onMaxTokensChange: (value: number) => void
}

export function ModelSettings({
  temperature,
  maxTokens,
  onTemperatureChange,
  onMaxTokensChange,
}: ModelSettingsProps) {
  return (
    <div className="space-y-4 rounded-lg border-2 border-gray-200 p-4">
      <h3 className="font-mono text-xs font-bold tracking-wider text-gray-500">
        PENGATURAN LANJUTAN
      </h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="temperature" className="text-sm font-medium">
              Temperature
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">
                    Rendah = konsisten & fokus. Tinggi = kreatif & variatif.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-mono text-sm font-bold">{temperature.toFixed(1)}</span>
        </div>
        <Slider
          id="temperature"
          min={0}
          max={2}
          step={0.1}
          value={[temperature]}
          onValueChange={([val]) => onTemperatureChange(val ?? 0.7)}
          className="w-full"
          aria-label="Temperature"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>PRESISI</span>
          <span>KREATIF</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="maxTokens" className="text-sm font-medium">
              Max Tokens
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">
                    Batas panjang output yang disarankan dalam prompt.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-mono text-sm font-bold">{maxTokens}</span>
        </div>
        <Slider
          id="maxTokens"
          min={100}
          max={4000}
          step={100}
          value={[maxTokens]}
          onValueChange={([val]) => onMaxTokensChange(val ?? 1024)}
          className="w-full"
          aria-label="Max tokens"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>SINGKAT</span>
          <span>PANJANG</span>
        </div>
      </div>
    </div>
  )
}
