export type PromptMode = 'implement' | 'review' | 'debug' | 'plan' | 'verify'

export interface LightweightContext {
  repoName: string
  workspacePath: string
  activeFilePath: string
  coreRuleSource: string
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

const MODE_LABELS: Record<PromptMode, string> = {
  implement: 'Implement',
  review: 'Review',
  debug: 'Debug',
  plan: 'Plan',
  verify: 'Verify',
}

const MODE_GUIDANCE: Record<PromptMode, string> = {
  implement: 'Focus on the smallest safe implementation that solves the request.',
  review: 'Focus on findings, regressions, risks, and missing tests before summaries.',
  debug: 'Focus on reproduction, root cause, and the smallest safe fix.',
  plan: 'Focus on an ordered implementation plan with scoped tasks and verification.',
  verify: 'Focus on proof, checks run, expected outcomes, and remaining risk.',
}

function normalizeText(value: string): string {
  return value.trim().replace(/\r\n/g, '\n')
}

function safeValue(value: string, fallback: string): string {
  const trimmed = value.trim()
  return trimmed ? trimmed : fallback
}

export function composePrompt(input: ComposeInput): ComposeResult {
  const modeLabel = MODE_LABELS[input.mode]
  const userRequest = normalizeText(input.rawInput)

  const finalPrompt = [
    `Mode: ${modeLabel}`,
    '',
    'Context:',
    `- Repository: ${safeValue(input.context.repoName, 'unknown')}`,
    `- Workspace: ${safeValue(input.context.workspacePath, 'unknown')}`,
    `- Active file: ${safeValue(input.context.activeFilePath, 'none')}`,
    `- Core rule source: ${safeValue(input.context.coreRuleSource, 'unknown')}`,
    '',
    'Guidance:',
    `- ${MODE_GUIDANCE[input.mode]}`,
    '- Preserve existing patterns and keep the scope tight.',
    '- Verify the result before claiming completion.',
    '',
    'Chief request:',
    userRequest,
  ].join('\n')

  return {
    mode: input.mode,
    modeLabel,
    finalPrompt,
  }
}
