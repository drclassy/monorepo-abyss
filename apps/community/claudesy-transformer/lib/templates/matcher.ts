// Claudesy Transformer Engine V2 — Template Matcher
import type { TemplateDefinition, TaskType } from '@/types'
import { allTemplates, templatesByCategory } from '@/data/templates'

const TASK_TO_CATEGORY: Record<TaskType, string> = {
  CODING: 'CODING',
  EMAIL: 'EMAIL',
  ANALYSIS: 'ANALYSIS',
  CREATIVE: 'CREATIVE',
  RESEARCH: 'RESEARCH',
  BUSINESS: 'BUSINESS',
  EDUCATION: 'EDUCATION',
  MARKETING: 'MARKETING',
  GENERAL: '',
}

export function matchTemplate(
  rawIdea: string,
  taskType: TaskType
): TemplateDefinition | undefined {
  const category = TASK_TO_CATEGORY[taskType]

  // If task type maps to a category, find best match within that category
  if (category && category in templatesByCategory) {
    const candidates =
      templatesByCategory[category as keyof typeof templatesByCategory]
    return findBestMatch(rawIdea, candidates)
  }

  // For GENERAL, search all templates
  return findBestMatch(rawIdea, allTemplates)
}

function findBestMatch(
  rawIdea: string,
  candidates: readonly TemplateDefinition[]
): TemplateDefinition | undefined {
  if (candidates.length === 0) return undefined

  const ideaLower = rawIdea.toLowerCase()
  let bestScore = 0
  let bestTemplate: TemplateDefinition | undefined

  for (const template of candidates) {
    let score = 0

    // Check slug keywords
    const slugWords = template.slug.split('-')
    for (const word of slugWords) {
      if (ideaLower.includes(word)) score += 3
    }

    // Check name keywords
    const nameWords = template.name.toLowerCase().split(/\s+/)
    for (const word of nameWords) {
      if (word.length > 2 && ideaLower.includes(word)) score += 2
    }

    // Check description keywords
    const descWords = template.description.toLowerCase().split(/\s+/)
    for (const word of descWords) {
      if (word.length > 3 && ideaLower.includes(word)) score += 1
    }

    if (score > bestScore) {
      bestScore = score
      bestTemplate = template
    }
  }

  // Return first template as fallback if no keyword match
  return bestTemplate ?? candidates[0]
}
