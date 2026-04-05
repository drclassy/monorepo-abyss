// Claudesy CTE V2 — Main transform form

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Send, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelSettings } from "./ModelSettings"
import { TransformRequestSchema } from "@/lib/schemas"
import type { TransformRequest, TransformMode } from "@/lib/schemas"
import { MODELS, MODES, LIMITS } from "@/lib/constants"

interface TransformFormProps {
  onSubmit: (data: TransformRequest) => void
  isLoading: boolean
  defaultValues?: Partial<TransformRequest>
}

export function TransformForm({
  onSubmit,
  isLoading,
  defaultValues,
}: TransformFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const form = useForm<TransformRequest>({
    resolver: zodResolver(TransformRequestSchema),
    defaultValues: {
      prompt: "",
      model: "claude-sonnet",
      mode: "professional",
      temperature: 0.7,
      maxTokens: 1024,
      locale: "id",
      ...defaultValues,
    },
  })

  const promptValue = form.watch("prompt")
  const charCount = promptValue?.length ?? 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-xs font-bold tracking-wider text-gray-500">
                PROMPT MENTAH
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Masukkan ide atau prompt mentah Anda di sini... (min. 10 karakter)"
                  className="min-h-[140px] resize-y border-2 border-gray-300 font-mono text-sm focus:border-black"
                  {...field}
                />
              </FormControl>
              <div className="flex items-center justify-between">
                <FormMessage />
                <span
                  className={`font-mono text-xs ${
                    charCount > LIMITS.maxPromptLength
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {charCount}/{LIMITS.maxPromptLength}
                </span>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs font-bold tracking-wider text-gray-500">
                  MODEL
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-2 border-gray-300 font-mono text-sm">
                      <SelectValue placeholder="Pilih model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MODELS.map((model) => (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                        className="font-mono text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{model.name}</span>
                          <span className="text-xs text-gray-500">
                            {model.provider}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locale"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs font-bold tracking-wider text-gray-500">
                  BAHASA OUTPUT
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-2 border-gray-300 font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="id" className="font-mono text-sm">
                      Indonesia
                    </SelectItem>
                    <SelectItem value="en" className="font-mono text-sm">
                      English
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-xs font-bold tracking-wider text-gray-500">
                MODE
              </FormLabel>
              <Tabs
                value={field.value}
                onValueChange={(v) => field.onChange(v as TransformMode)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5 h-auto">
                  {MODES.map((mode) => (
                    <TabsTrigger
                      key={mode.id}
                      value={mode.id}
                      className="px-2 py-2 font-mono text-[11px] data-[state=active]:bg-black data-[state=active]:text-white"
                    >
                      {mode.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors font-mono"
        >
          {showAdvanced ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          PENGATURAN LANJUTAN
        </button>

        {showAdvanced && (
          <ModelSettings
            temperature={form.watch("temperature")}
            maxTokens={form.watch("maxTokens")}
            onTemperatureChange={(v) => form.setValue("temperature", v)}
            onMaxTokensChange={(v) => form.setValue("maxTokens", v)}
          />
        )}

        <Button
          type="submit"
          disabled={isLoading || charCount < LIMITS.minPromptLength}
          className="w-full bg-black text-white hover:bg-gray-800 font-mono font-bold tracking-wider h-12 text-sm"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              TRANSFORMING...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              TRANSFORM PROMPT
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
