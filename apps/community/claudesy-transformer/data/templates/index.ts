// Claudesy Transformer Engine V2 — Template Aggregator
import type { TemplateDefinition } from '@/types'
import { codingTemplates } from './coding'
import { emailTemplates } from './email'
import { analysisTemplates } from './analysis'
import { creativeTemplates } from './creative'
import { researchTemplates } from './research'
import { businessTemplates } from './business'
import { educationTemplates } from './education'
import { marketingTemplates } from './marketing'

export const allTemplates: TemplateDefinition[] = [
  ...codingTemplates,
  ...emailTemplates,
  ...analysisTemplates,
  ...creativeTemplates,
  ...researchTemplates,
  ...businessTemplates,
  ...educationTemplates,
  ...marketingTemplates,
]

export const templatesByCategory = {
  CODING: codingTemplates,
  EMAIL: emailTemplates,
  ANALYSIS: analysisTemplates,
  CREATIVE: creativeTemplates,
  RESEARCH: researchTemplates,
  BUSINESS: businessTemplates,
  EDUCATION: educationTemplates,
  MARKETING: marketingTemplates,
} as const

export {
  codingTemplates,
  emailTemplates,
  analysisTemplates,
  creativeTemplates,
  researchTemplates,
  businessTemplates,
  educationTemplates,
  marketingTemplates,
}
