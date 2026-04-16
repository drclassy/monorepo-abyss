/**
 * Copyright 2026 Google LLC
 * 
 * Sentra AI Hybrid Brain - NotebookLM Connector
 * Project: sentra-healthcare-solution
 * Managed by Jen (Sentra Adjutant)
 */

import { VertexAI, GenerativeModel, Tool } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

dotenv.config();

export interface NotebookConfig {
  projectId: string;
  location: string;
  corpusId: string;
  modelName?: string;
}

export class NotebookLMConnector {
  private vertexAI: VertexAI;
  private model: GenerativeModel;

  constructor(config?: Partial<NotebookConfig>) {
    const projectId = config?.projectId || process.env.GOOGLE_PROJECT_ID || 'sentra-healthcare-solution';
    const location = config?.location || process.env.GOOGLE_LOCATION || 'us-central1';
    const corpusId = config?.corpusId || process.env.NOTEBOOK_CORPUS_ID;
    const modelName = config?.modelName || process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!corpusId) {
      console.warn('[NotebookLM] Warning: No Corpus ID provided. RAG features will be disabled.');
    }

    this.vertexAI = new VertexAI({ project: projectId, location: location });

    // Setup RAG Tooling
    const tools: Tool[] = [];
    if (corpusId) {
      tools.push({
        retrieval: {
          vertexRagStore: {
            ragResources: [{ ragCorpus: corpusId }],
            similarityTopK: 10,
          },
        } as any,
      });
    }

    this.model = this.vertexAI.getGenerativeModel({
      model: modelName,
      tools: tools.length > 0 ? tools : undefined,
    });
  }

  /**
   * Inti dari Behavioral Intelligence: Bertanya dengan konteks memori NotebookLM.
   */
  async query(prompt: string) {
    try {
      console.log(`[Jen] Consulting the Brain for: "${prompt.substring(0, 50)}..."`);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      return {
        answer: response.text(),
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Jen] Brain Consult Failed:', error);
      return {
        answer: 'Maaf Chief, saya mengalami gangguan saat mencoba mengakses memori NotebookLM.',
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
