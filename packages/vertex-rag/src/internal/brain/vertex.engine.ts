import { VertexAI, GenerativeModel, Tool } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

import { resolveProjectId } from '../gcp-project';

dotenv.config();

export interface VertexSearchResult {
  text: string
  status: 'SUCCESS' | 'ERROR'
  metadata?: unknown
  error?: unknown
}

export class VertexEngine {
  private vertexAI!: VertexAI;
  private model!: GenerativeModel;

  constructor() {
    const projectId = resolveProjectId();
    const location = process.env.GCP_LOCATION || 'us-central1';
    const corpusId = process.env.VERTEX_RAG_CORPUS_ID || process.env.NOTEBOOK_CORPUS_ID;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (corpusId) {
      this.vertexAI = new VertexAI({ project: projectId, location: location });
      
      const fullCorpusName = corpusId.includes('/') 
        ? corpusId 
        : `projects/${projectId}/locations/${location}/ragCorpora/${corpusId}`;

      const tools: Tool[] = [{
        retrieval: {
          vertexRagStore: {
            ragResources: [{ ragCorpus: fullCorpusName }],
            similarityTopK: 10,
          },
        } as any,
      }];

      this.model = this.vertexAI.getGenerativeModel({
        model: modelName,
        tools: tools,
      });
    }
  }

  async search(prompt: string): Promise<VertexSearchResult> {
    if (!this.model) {
      return { text: 'Library not connected', status: 'ERROR' };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = "";
      try {
        const candidates = (response as any).candidates;
        text = candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      } catch {
        text = "Error parsing response";
      }


      return {
        text,
        metadata: response.candidates?.[0]?.groundingMetadata,
        status: "SUCCESS"
      };
    } catch (error) {
      return { text: "Search failed", status: "ERROR", error };
    }
  }
}
