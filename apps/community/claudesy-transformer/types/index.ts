// Claudesy Transformer Engine V2 — Zod Contracts & Types
import { z } from 'zod'

// ── Enums ────────────────────────────────────────────────────────────────

export const LLMProviderNameSchema = z.enum([
  'CLAUDE',
  'OPENAI',
  'MISTRAL',
  'GEMINI',
  'QWEN',
  'GROK',
  'LOCAL',
])
export type LLMProviderName = z.infer<typeof LLMProviderNameSchema>

export const TaskTypeSchema = z.enum([
  'CODING',
  'EMAIL',
  'ANALYSIS',
  'CREATIVE',
  'RESEARCH',
  'BUSINESS',
  'EDUCATION',
  'MARKETING',
  'GENERAL',
])
export type TaskType = z.infer<typeof TaskTypeSchema>

export const PromptToneSchema = z.enum([
  'PROFESSIONAL',
  'CASUAL',
  'TECHNICAL',
  'ACADEMIC',
  'CREATIVE',
  'PERSUASIVE',
])
export type PromptTone = z.infer<typeof PromptToneSchema>

export const OutputFormatSchema = z.enum([
  'DETAILED',
  'CONCISE',
  'STRUCTURED',
  'STEP_BY_STEP',
  'CONVERSATIONAL',
])
export type OutputFormat = z.infer<typeof OutputFormatSchema>

export const TemplateCategorySchema = z.enum([
  'CODING',
  'EMAIL',
  'ANALYSIS',
  'CREATIVE',
  'RESEARCH',
  'BUSINESS',
  'EDUCATION',
  'MARKETING',
])
export type TemplateCategory = z.infer<typeof TemplateCategorySchema>

// ── Request Schemas ──────────────────────────────────────────────────────

export const OptimizeRequestSchema = z.object({
  rawIdea: z
    .string()
    .min(1, 'Raw idea is required')
    .max(10_000, 'Raw idea too long'),
  taskType: TaskTypeSchema.default('GENERAL'),
  tone: PromptToneSchema.default('PROFESSIONAL'),
  format: OutputFormatSchema.default('STRUCTURED'),
  targetLlm: LLMProviderNameSchema.default('CLAUDE'),
  provider: LLMProviderNameSchema.default('CLAUDE'),
  templateSlug: z.string().optional(),
  apiKey: z.string().optional(),
})
export type OptimizeRequest = z.infer<typeof OptimizeRequestSchema>

export const EvaluateRequestSchema = z.object({
  promptText: z
    .string()
    .min(1, 'Prompt text is required')
    .max(50_000, 'Prompt too long'),
  provider: LLMProviderNameSchema.default('CLAUDE'),
  apiKey: z.string().optional(),
})
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>

export const ProviderKeySourceSchema = z.enum(['USER', 'ENV', 'LOCAL', 'NONE'])
export type ProviderKeySource = z.infer<typeof ProviderKeySourceSchema>

export const ProviderKeyStatusSchema = z.object({
  provider: LLMProviderNameSchema,
  hasKey: z.boolean(),
  source: ProviderKeySourceSchema,
})
export type ProviderKeyStatus = z.infer<typeof ProviderKeyStatusSchema>

const NonLocalProviderSchema = LLMProviderNameSchema.refine(
  (provider) => provider !== 'LOCAL',
  'Local provider does not use API keys'
)

export const ProviderKeyListResponseSchema = z.object({
  providers: z.array(ProviderKeyStatusSchema),
})
export type ProviderKeyListResponse = z.infer<typeof ProviderKeyListResponseSchema>

export const SaveProviderKeyRequestSchema = z.object({
  provider: NonLocalProviderSchema,
  apiKey: z.string().trim().min(1, 'API key is required').max(4096),
})
export type SaveProviderKeyRequest = z.infer<typeof SaveProviderKeyRequestSchema>

export const DeleteProviderKeyRequestSchema = z.object({
  provider: NonLocalProviderSchema,
})
export type DeleteProviderKeyRequest = z.infer<typeof DeleteProviderKeyRequestSchema>

export const RegisterRequestSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(120, 'Nama terlalu panjang'),
  email: z.string().trim().email('Email tidak valid').max(320, 'Email terlalu panjang'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(256, 'Password terlalu panjang'),
})
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

export const EmailActionRequestSchema = z.object({
  email: z.string().trim().email('Email tidak valid').max(320, 'Email terlalu panjang'),
})
export type EmailActionRequest = z.infer<typeof EmailActionRequestSchema>

export const CreatePromptSchema = z.object({
  rawInput: z.string().min(1),
  optimizedText: z.string().min(1),
  taskType: TaskTypeSchema,
  tone: PromptToneSchema,
  format: OutputFormatSchema,
  targetLlm: LLMProviderNameSchema,
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
})
export type CreatePrompt = z.infer<typeof CreatePromptSchema>

export const RecommendRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  limit: z.number().int().min(1).max(20).default(5),
  includePublic: z.boolean().default(true),
})
export type RecommendRequest = z.infer<typeof RecommendRequestSchema>

// ── Response Types ───────────────────────────────────────────────────────

export const SuperPromptSchema = z.object({
  role: z.string(),
  task: z.string(),
  context: z.string(),
  chainOfThought: z.string(),
  constraints: z.array(z.string()),
  formatSpec: z.string(),
  fullPrompt: z.string(),
})
export type SuperPrompt = z.infer<typeof SuperPromptSchema>

export const OptimizeResponseSchema = z.object({
  superPrompt: SuperPromptSchema,
  metadata: z.object({
    provider: LLMProviderNameSchema,
    model: z.string(),
    templateUsed: z.string().optional(),
    taskType: TaskTypeSchema,
    tone: PromptToneSchema,
    format: OutputFormatSchema,
    tokensUsed: z.number().optional(),
    latencyMs: z.number(),
  }),
})
export type OptimizeResponse = z.infer<typeof OptimizeResponseSchema>

export const EvaluationDimensionSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number().min(0).max(10),
  feedback: z.string(),
  weight: z.number(),
})
export type EvaluationDimension = z.infer<typeof EvaluationDimensionSchema>

export const EvaluateResponseSchema = z.object({
  overallScore: z.number().min(0).max(10),
  dimensions: z.array(EvaluationDimensionSchema),
  suggestions: z.array(z.string()),
  metadata: z.object({
    provider: LLMProviderNameSchema,
    model: z.string(),
    tokensUsed: z.number().optional(),
    latencyMs: z.number(),
  }),
})
export type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>

export const PromptRecordSchema = z.object({
  id: z.string(),
  rawInput: z.string(),
  optimizedText: z.string(),
  taskType: TaskTypeSchema,
  tone: PromptToneSchema,
  format: OutputFormatSchema,
  targetLlm: LLMProviderNameSchema,
  tags: z.array(z.string()),
  isPublic: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type PromptRecord = z.infer<typeof PromptRecordSchema>

export const RecommendResponseSchema = z.object({
  recommendations: z.array(
    z.object({
      prompt: PromptRecordSchema,
      similarity: z.number(),
    })
  ),
})
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>

// ── Template Types ───────────────────────────────────────────────────────

export const TemplateVariableSchema = z.object({
  name: z.string(),
  description: z.string(),
  required: z.boolean().default(true),
  defaultValue: z.string().optional(),
})
export type TemplateVariable = z.infer<typeof TemplateVariableSchema>

export const TemplateDefinitionSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: TemplateCategorySchema,
  template: z.object({
    role: z.string(),
    taskStructure: z.string(),
    cotGuidance: z.string(),
    constraints: z.array(z.string()),
    formatSpec: z.string(),
    qualityChecklist: z.array(z.string()),
  }),
  variables: z.array(TemplateVariableSchema).default([]),
})
export type TemplateDefinition = z.infer<typeof TemplateDefinitionSchema>

// ── LLM Provider Types ──────────────────────────────────────────────────

export const LLMRequestSchema = z.object({
  systemPrompt: z.string(),
  userPrompt: z.string(),
  maxTokens: z.number().int().default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
})
export type LLMRequest = z.infer<typeof LLMRequestSchema>

export const LLMResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  tokensUsed: z.number().optional(),
  finishReason: z.string().optional(),
})
export type LLMResponse = z.infer<typeof LLMResponseSchema>
