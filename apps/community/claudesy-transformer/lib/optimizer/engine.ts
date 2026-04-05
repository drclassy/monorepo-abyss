// Claudesy Transformer Engine V2 — Optimizer Engine
import type { OptimizeRequest, OptimizeResponse, SuperPrompt } from '@/types'
import { getProvider } from '@/lib/llm/provider-registry'
import {
  buildOptimizeSystemPrompt,
  buildOptimizeUserPrompt,
} from '@/lib/llm/prompt-builder'
import { matchTemplate } from '@/lib/templates/matcher'
import { renderTemplate } from '@/lib/templates/renderer'
import { getTemplateBySlug } from '@/lib/templates/loader'
import { getStrategyHints } from './strategies'
import { parseSuperPromptJson } from './super-prompt-format'

/**
 * Transforms a raw, unstructured idea into a high-performance "Super Prompt".
 * 
 * The optimization process includes:
 * 1. Semantic template matching based on the raw idea and task type.
 * 2. Injection of domain-specific strategy hints (Emphasis Areas, Constraints).
 * 3. Structural reinforcement using the proprietary Super-Prompt format.
 * 4. LLM-powered generation of the role, task, context, and chain-of-thought elements.
 * 
 * @param request - The optimization request with raw idea, task type, tone, and format preferences.
 * @returns An optimized Super Prompt object includes role, task, constraints, and the full prompt string.
 * 
 * @example
 * const optimized = await optimizePrompt({ 
 *   rawIdea: "Build a landing page", 
 *   taskType: "CODING", 
 *   tone: "TECHNICAL" 
 * });
 */
export async function optimizePrompt(
  request: OptimizeRequest
): Promise<OptimizeResponse> {
  const startTime = Date.now()

  // 1. Resolve template
  const template = request.templateSlug
    ? getTemplateBySlug(request.templateSlug)
    : matchTemplate(request.rawIdea, request.taskType)

  // 2. Get strategy hints
  const hints = getStrategyHints(
    request.taskType,
    request.tone,
    request.format
  )

  // 3. Build template context if available
  let templateContext: string | undefined
  if (template) {
    const rendered = renderTemplate(template)
    templateContext = `Template: ${template.name}\n\n${rendered}\n\nAdditional emphasis: ${hints.emphasisAreas.join(', ')}\nAdditional constraints: ${hints.additionalConstraints.join('; ')}`
  }

  // 4. Build LLM prompts
  const systemPrompt = buildOptimizeSystemPrompt()
  const userPrompt = buildOptimizeUserPrompt({
    rawIdea: request.rawIdea,
    taskType: request.taskType,
    tone: request.tone,
    format: request.format,
    targetLlm: request.targetLlm,
    templateContext,
  })

  // 5. Call LLM provider
  const provider = getProvider(request.provider, request.apiKey)
  const llmResponse = await provider.generate({
    systemPrompt,
    userPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  })

  // 6. Parse response into SuperPrompt
  let superPrompt: SuperPrompt
  try {
    superPrompt = parseSuperPromptJson(llmResponse.content)
  } catch {
    // Fallback: wrap raw response as the full prompt
    superPrompt = {
      role: 'Expert assistant',
      task: request.rawIdea,
      context: '',
      chainOfThought: '',
      constraints: [],
      formatSpec: '',
      fullPrompt: llmResponse.content,
    }
  }

  const latencyMs = Date.now() - startTime

  return {
    superPrompt,
    metadata: {
      provider: request.provider,
      model: llmResponse.model,
      templateUsed: template?.slug,
      taskType: request.taskType,
      tone: request.tone,
      format: request.format,
      tokensUsed: llmResponse.tokensUsed,
      latencyMs,
    },
  }
}
