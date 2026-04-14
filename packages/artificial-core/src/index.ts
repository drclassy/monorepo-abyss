// @the-abyss/ai-core - Multi-Model Consensus & LLM Orchestration

/** LLM orchestration client and multi-model consensus function. */
export { AiCoreClient, getConsensus } from './client'

/** Template-based prompt builder with versioning and variable interpolation. */
export { PromptManager } from './prompt-manager'

/** Type contracts for model providers, responses, and consensus results. */
export type { ModelProvider, ModelResponse, ConsensusResult } from './types'
