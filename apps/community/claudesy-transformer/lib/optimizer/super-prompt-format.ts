// Claudesy Transformer Engine V2 — Super Prompt Formatter
import type { SuperPrompt } from '@/types'

export function formatSuperPrompt(parsed: SuperPrompt): string {
  return parsed.fullPrompt
}

export function parseSuperPromptJson(raw: string): SuperPrompt {
  // Try to extract JSON from the response (handles markdown fences)
  let jsonStr = raw.trim()

  // Remove markdown code fences if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  const parsed = JSON.parse(jsonStr)

  return {
    role: parsed.role ?? '',
    task: parsed.task ?? '',
    context: parsed.context ?? '',
    chainOfThought: parsed.chainOfThought ?? '',
    constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
    formatSpec: parsed.formatSpec ?? '',
    fullPrompt: parsed.fullPrompt ?? buildFullPrompt(parsed),
  }
}

function buildFullPrompt(parsed: Partial<SuperPrompt>): string {
  const parts: string[] = []

  if (parsed.role) {
    parts.push(`You are ${parsed.role}.`)
  }
  if (parsed.task) {
    parts.push(`\n## Task\n${parsed.task}`)
  }
  if (parsed.context) {
    parts.push(`\n## Context\n${parsed.context}`)
  }
  if (parsed.chainOfThought) {
    parts.push(`\n## Approach\n${parsed.chainOfThought}`)
  }
  if (parsed.constraints && parsed.constraints.length > 0) {
    parts.push(
      `\n## Constraints\n${parsed.constraints.map((c) => `- ${c}`).join('\n')}`
    )
  }
  if (parsed.formatSpec) {
    parts.push(`\n## Output Format\n${parsed.formatSpec}`)
  }

  return parts.join('\n')
}
