import { getMissionModeLabel, renderCodexMission } from './mission-renderer'
import { classifyMissionIntent, standardizeMissionRequest } from './mission-standardizer'

export type PromptMode = 'implement' | 'review' | 'debug' | 'plan' | 'verify'
export type PromptConsoleView = 'compose' | 'audit' | 'rewrite'

export type AuditTargetSource = 'selection' | 'document' | 'none'
export type PromptSourceKind = 'selection' | 'document' | 'clipboard' | 'blank'

export interface LightweightContext {
  repoName: string
  workspacePath: string
  activeFilePath: string
  coreRuleSource: string
}

export interface ResolveAuditTargetInput {
  selectionText: string
  documentText: string
}

export interface AuditTarget {
  source: AuditTargetSource
  selectedText: string
  notice: string
}

export interface ComposeInput {
  mode: PromptMode
  rawInput: string
  context: LightweightContext
}

export interface ComposeResult {
  mode: PromptMode
  modeLabel: string
  finalPrompt: string
}

const PROMPT_SOURCE_LABELS: Record<PromptSourceKind, string> = {
  selection: 'Active Selection',
  document: 'Current File',
  clipboard: 'Clipboard',
  blank: 'Blank Draft',
}

function normalizeText(value: string): string {
  return value.trim().replace(/\r\n/g, '\n')
}

function safeValue(value: string, fallback: string): string {
  const trimmed = value.trim()
  return trimmed ? trimmed : fallback
}

export function resolveAuditTarget(input: ResolveAuditTargetInput): AuditTarget {
  if (input.selectionText.trim()) {
    return {
      source: 'selection',
      selectedText: input.selectionText,
      notice: '',
    }
  }

  if (input.documentText.trim()) {
    return {
      source: 'document',
      selectedText: input.documentText,
      notice: 'No prompt selection found. Auditing the current file content instead.',
    }
  }

  return {
    source: 'none',
    selectedText: '',
    notice: 'No prompt content is available here yet. Opening Sentra Prompt Console instead.',
  }
}

export function getPromptSourceLabel(source: PromptSourceKind): string {
  return PROMPT_SOURCE_LABELS[source]
}

export function canWriteBackPromptSource(source: PromptSourceKind): boolean {
  return source === 'selection' || source === 'document'
}

export function composePrompt(input: ComposeInput): ComposeResult {
  const userRequest = normalizeText(input.rawInput)
  const safeContext = {
    repoName: safeValue(input.context.repoName, 'unknown'),
    workspacePath: safeValue(input.context.workspacePath, 'unknown'),
    activeFilePath: input.context.activeFilePath.trim(),
    coreRuleSource: safeValue(input.context.coreRuleSource, 'unknown'),
  }
  const classification = classifyMissionIntent(userRequest, safeContext, input.mode)
  const mission = standardizeMissionRequest(userRequest, safeContext, classification)
  const finalPrompt = renderCodexMission(mission)

  return {
    mode: input.mode,
    modeLabel: getMissionModeLabel(mission.mode),
    finalPrompt,
  }
}
