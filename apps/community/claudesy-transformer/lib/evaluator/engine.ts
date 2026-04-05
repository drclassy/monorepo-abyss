// Claudesy Transformer Engine V2 — Evaluator Engine
import type { EvaluateRequest, EvaluateResponse } from '@/types'
import { getProvider } from '@/lib/llm/provider-registry'
import {
  buildEvaluateSystemPrompt,
  buildEvaluateUserPrompt,
} from '@/lib/llm/prompt-builder'
import { normalizeScores, calculateOverallScore } from './scoring'

/**
 * Evaluates the quality of a given prompt using an LLM-as-a-Judge approach.
 * 
 * This function performs the following steps:
 * 1. Builds specialized system and user prompts for evaluation.
 * 2. Calls the primary LLM provider to analyze the prompt.
 * 3. Parses the structured feedback (Structure, Clarity, Completeness, Specificity).
 * 4. Normalizes scores and calculates a weighted overall quality score.
 * 5. Provides actionable improvement suggestions.
 * 
 * @param request - The evaluation request containing the prompt text and optional provider settings.
 * @returns A structured evaluation response with scores, feedback, and metadata.
 * 
 * @example
 * const result = await evaluatePrompt({ promptText: "Write a poem about AI", provider: "CLAUDE" });
 * console.log(result.overallScore); // e.g., 8.5
 */
export async function evaluatePrompt(
  request: EvaluateRequest
): Promise<EvaluateResponse> {
  const startTime = Date.now()

  const systemPrompt = buildEvaluateSystemPrompt()
  const userPrompt = buildEvaluateUserPrompt({
    promptText: request.promptText,
  })

  const provider = getProvider(request.provider, request.apiKey)
  const llmResponse = await provider.generate({
    systemPrompt,
    userPrompt,
    maxTokens: 2048,
    temperature: 0.3,
  })

  // Parse LLM evaluation response
  let parsedEval: Record<string, unknown>
  try {
    let jsonStr = llmResponse.content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()
    parsedEval = JSON.parse(jsonStr)
  } catch {
    // Fallback scores if parsing fails
    parsedEval = {
      structure: { score: 5, feedback: 'Could not parse evaluation' },
      clarity: { score: 5, feedback: 'Could not parse evaluation' },
      completeness: { score: 5, feedback: 'Could not parse evaluation' },
      specificity: { score: 5, feedback: 'Could not parse evaluation' },
      suggestions: ['Try re-evaluating with a different provider'],
    }
  }

  const dimensions = normalizeScores(
    parsedEval as Record<string, { score: number; feedback: string }>
  )
  const overallScore = calculateOverallScore(dimensions)
  const suggestions = Array.isArray(parsedEval.suggestions)
    ? (parsedEval.suggestions as string[])
    : []

  const latencyMs = Date.now() - startTime

  return {
    overallScore,
    dimensions,
    suggestions,
    metadata: {
      provider: request.provider,
      model: llmResponse.model,
      tokensUsed: llmResponse.tokensUsed,
      latencyMs,
    },
  }
}
