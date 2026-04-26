/**
 * Copyright 2026 Google LLC
 *
 * Sentra AI Hybrid Brain - Vertex RAG Connector
 * Project: tenacious-crane-494419-j5
 * Managed by Jen (Sentra Adjutant)
 */

import { VertexAI, GenerativeModel, Tool } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

import { resolveProjectId } from './internal/gcp-project';

dotenv.config();

export interface VertexRAGConfig {
  projectId: string;
  location: string;
  corpusId: string;
  modelName?: string;
}

export class VertexRAGConnector {
  private vertexAI!: VertexAI;
  private model!: GenerativeModel;

  constructor(config?: Partial<VertexRAGConfig>) {
    const projectId = resolveProjectId(config?.projectId);
    const location = config?.location || process.env.GCP_LOCATION || 'us-central1';
    const corpusId = config?.corpusId || process.env.VERTEX_RAG_CORPUS_ID || process.env.NOTEBOOK_CORPUS_ID;
    const modelName = config?.modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!corpusId) {
      console.warn('[Vertex RAG] Warning: No Corpus ID provided. RAG features will be disabled.');
      return;
    }

    this.vertexAI = new VertexAI({ project: projectId, location: location });

    // Setup RAG Tooling
    const tools: Tool[] = [];
    
    // Pastikan format Corpus ID menggunakan Full Resource Name dari GCP
    const fullCorpusName = corpusId.includes('/') 
      ? corpusId 
      : `projects/${projectId}/locations/${location}/ragCorpora/${corpusId}`;

    tools.push({
      retrieval: {
        vertexRagStore: {
          ragResources: [{ ragCorpus: fullCorpusName }],
          similarityTopK: 10,
        },
      } as any,
    });

    this.model = this.vertexAI.getGenerativeModel({
      model: modelName,
      tools: tools.length > 0 ? tools : undefined,
    });
  }

  /**
   * Inti dari Behavioral Intelligence: Bertanya dengan konteks memori Vertex RAG.
   */
  async query(prompt: string) {
    if (!this.model) {
      return {
        answer: 'Maaf Chief, memori RAG tidak terdeteksi. Pastikan VERTEX_RAG_CORPUS_ID sudah benar.',
        status: 'ERROR',
        error: 'Model not initialized due to missing Corpus ID'
      };
    }

    try {
      console.log(`[Jen] Consulting the Brain for: "${prompt.substring(0, 50)}..."`);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      // Handle the response text in a more robust way for 2026 SDK
      let answer = "";
      try {
        const candidates = (response as any).candidates;
        answer = candidates?.[0]?.content?.parts?.[0]?.text || "No text returned";
      } catch (e) {
        console.warn("[Jen] Text extraction failed", e);
        answer = "Error extracting response";
      }
      
      return {
        answer: answer,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Jen] Vertex RAG Consult Failed:', error);
      return {
        answer: 'Maaf Chief, saya mengalami gangguan saat mencoba mengakses memori Vertex RAG.',
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
