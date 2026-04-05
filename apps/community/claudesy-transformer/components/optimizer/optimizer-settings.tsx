// Claudesy Transformer Engine V2 — Optimizer Settings
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TaskType, PromptTone, OutputFormat, LLMProviderName } from '@/types'

interface OptimizerSettingsProps {
  taskType: TaskType
  tone: PromptTone
  format: OutputFormat
  targetLlm: LLMProviderName
  provider: LLMProviderName
  onTaskTypeChange: (v: TaskType) => void
  onToneChange: (v: PromptTone) => void
  onFormatChange: (v: OutputFormat) => void
  onTargetLlmChange: (v: LLMProviderName) => void
  onProviderChange: (v: LLMProviderName) => void
  disabled?: boolean
}

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'CODING', label: 'Coding' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'ANALYSIS', label: 'Analysis' },
  { value: 'CREATIVE', label: 'Creative' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'MARKETING', label: 'Marketing' },
]

const TONES: { value: PromptTone; label: string }[] = [
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'CASUAL', label: 'Casual' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'CREATIVE', label: 'Creative' },
  { value: 'PERSUASIVE', label: 'Persuasive' },
]

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'STRUCTURED', label: 'Structured' },
  { value: 'DETAILED', label: 'Detailed' },
  { value: 'CONCISE', label: 'Concise' },
  { value: 'STEP_BY_STEP', label: 'Step by Step' },
  { value: 'CONVERSATIONAL', label: 'Conversational' },
]

const PROVIDERS: { value: LLMProviderName; label: string }[] = [
  { value: 'CLAUDE', label: 'Claude' },
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'MISTRAL', label: 'Mistral' },
  { value: 'GEMINI', label: 'Gemini' },
  { value: 'QWEN', label: 'Qwen' },
  { value: 'GROK', label: 'Grok' },
  { value: 'LOCAL', label: 'Local (Ollama)' },
]

function SettingSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-sentra-text-secondary">
        {label}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9 bg-surface-primary text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function OptimizerSettings(props: OptimizerSettingsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <SettingSelect
        label="Task Type"
        value={props.taskType}
        options={TASK_TYPES}
        onChange={props.onTaskTypeChange}
        disabled={props.disabled}
      />
      <SettingSelect
        label="Tone"
        value={props.tone}
        options={TONES}
        onChange={props.onToneChange}
        disabled={props.disabled}
      />
      <SettingSelect
        label="Format"
        value={props.format}
        options={FORMATS}
        onChange={props.onFormatChange}
        disabled={props.disabled}
      />
      <SettingSelect
        label="Target LLM"
        value={props.targetLlm}
        options={PROVIDERS}
        onChange={props.onTargetLlmChange}
        disabled={props.disabled}
      />
      <SettingSelect
        label="Provider"
        value={props.provider}
        options={PROVIDERS}
        onChange={props.onProviderChange}
        disabled={props.disabled}
      />
    </div>
  )
}
