// Claudesy Transformer Engine V2 — Prompt Builder
import type { TaskType, PromptTone, OutputFormat, LLMProviderName } from '@/types'

interface OptimizePromptParams {
  rawIdea: string
  taskType: TaskType
  tone: PromptTone
  format: OutputFormat
  targetLlm: LLMProviderName
  templateContext?: string
}

interface EvaluatePromptParams {
  promptText: string
}

const TONE_DESCRIPTORS: Record<PromptTone, string> = {
  PROFESSIONAL: 'professional, clear, and business-appropriate',
  CASUAL: 'friendly, conversational, and approachable',
  TECHNICAL: 'precise, technical, and detail-oriented',
  ACADEMIC: 'scholarly, well-cited, and rigorous',
  CREATIVE: 'imaginative, expressive, and engaging',
  PERSUASIVE: 'compelling, persuasive, and action-oriented',
}

const FORMAT_INSTRUCTIONS: Record<OutputFormat, string> = {
  DETAILED:
    'Provide comprehensive, in-depth output with thorough explanations.',
  CONCISE: 'Keep output brief and to-the-point, focusing on essentials.',
  STRUCTURED:
    'Use clear headings, bullet points, and organized sections.',
  STEP_BY_STEP:
    'Break down into numbered, sequential steps with clear progression.',
  CONVERSATIONAL:
    'Write in a natural, dialogue-friendly format.',
}

const TASK_CONTEXT: Record<TaskType, string> = {
  CODING:
    'software development, code generation, debugging, or architecture',
  EMAIL: 'email composition, follow-ups, or professional correspondence',
  ANALYSIS:
    'data analysis, research synthesis, or critical evaluation',
  CREATIVE:
    'creative writing, storytelling, content creation, or ideation',
  RESEARCH:
    'academic research, literature review, or investigation',
  BUSINESS:
    'business strategy, planning, proposals, or operations',
  EDUCATION:
    'teaching, curriculum design, explanations, or learning materials',
  MARKETING:
    'marketing copy, campaigns, social media, or brand messaging',
  GENERAL: 'general-purpose task completion',
}

/**
 * Generates the system prompt for the Optimization Engine.
 * 
 * The system prompt instructs the LLM to act as an Expert Prompt Engineer
 * and forces the output into a strictly structured JSON Super-Prompt format.
 * 
 * @returns The system prompt string.
 */
export function buildOptimizeSystemPrompt(): string {
  return `You are an expert Prompt Engineer. Your job is to transform raw, unstructured ideas into highly effective, structured "Super Prompts" that maximize the output quality of Large Language Models.

Your output MUST be a valid JSON object with this exact structure:
{
  "role": "The specific expert role the AI should adopt",
  "task": "Clear, specific task description",
  "context": "Relevant background and context",
  "chainOfThought": "Step-by-step reasoning guidance for the AI",
  "constraints": ["constraint 1", "constraint 2", ...],
  "formatSpec": "Exact output format specification",
  "fullPrompt": "The complete, ready-to-use super prompt combining all elements above into a single cohesive prompt"
}

Rules:
- The "fullPrompt" field must be a complete, self-contained prompt ready to paste into any LLM
- Include specific, actionable constraints (not vague guidelines)
- The chain-of-thought section should guide the AI's reasoning process
- Adapt the language and specificity to the target LLM
- Never include meta-commentary about the prompt itself in fullPrompt
- Output ONLY the JSON object, no markdown fences, no explanation`
}

export function buildOptimizeUserPrompt(params: OptimizePromptParams): string {
  const {
    rawIdea,
    taskType,
    tone,
    format,
    targetLlm,
    templateContext,
  } = params

  let prompt = `Transform this raw idea into a Super Prompt:

RAW IDEA: "${rawIdea}"

SETTINGS:
- Task Domain: ${TASK_CONTEXT[taskType]}
- Tone: ${TONE_DESCRIPTORS[tone]}
- Output Format: ${FORMAT_INSTRUCTIONS[format]}
- Target LLM: ${targetLlm}`

  if (templateContext) {
    prompt += `\n\nTEMPLATE GUIDANCE:\n${templateContext}`
  }

  prompt += `\n\nGenerate the Super Prompt JSON now.`

  return prompt
}

/**
 * Generates the system prompt for the Evaluation Engine.
 * 
 * The system prompt instructs the LLM to act as a Prompt Quality Evaluator
 * and perform a multi-dimensional analysis (Structure, Clarity, Completeness, Specificity).
 * 
 * @returns The system prompt string.
 */
export function buildEvaluateSystemPrompt(): string {
  return `You are an expert Prompt Quality Evaluator. Analyze prompts across 4 dimensions and provide actionable feedback.

Your output MUST be a valid JSON object with this exact structure:
{
  "structure": {
    "score": <number 0-10>,
    "feedback": "<specific feedback about prompt organization, sections, and logical flow>"
  },
  "clarity": {
    "score": <number 0-10>,
    "feedback": "<specific feedback about language clarity, ambiguity, and precision>"
  },
  "completeness": {
    "score": <number 0-10>,
    "feedback": "<specific feedback about missing context, constraints, or specifications>"
  },
  "specificity": {
    "score": <number 0-10>,
    "feedback": "<specific feedback about how specific vs vague the instructions are>"
  },
  "suggestions": [
    "<actionable improvement suggestion 1>",
    "<actionable improvement suggestion 2>",
    "<actionable improvement suggestion 3>"
  ]
}

Scoring rubric:
- 9-10: Exceptional, production-ready
- 7-8: Good, minor improvements possible
- 5-6: Adequate, significant room for improvement
- 3-4: Below average, major issues
- 1-2: Poor, needs complete rewrite

Output ONLY the JSON object, no markdown fences, no explanation.`
}

export function buildEvaluateUserPrompt(params: EvaluatePromptParams): string {
  return `Evaluate this prompt:\n\n"${params.promptText}"\n\nProvide your evaluation JSON now.`
}
