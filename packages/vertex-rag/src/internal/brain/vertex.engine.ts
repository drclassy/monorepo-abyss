import { VertexAI, GenerativeModel, Tool } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

dotenv.config();

export class VertexEngine {
  private vertexAI!: VertexAI;
  private model!: GenerativeModel;

  constructor() {
    const projectId = process.env.GOOGLE_PROJECT_ID || 'sentra-healthcare-solution';
    const location = process.env.GOOGLE_LOCATION || 'us-central1';
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

  async search(prompt: string) {
    if (!this.model) return { answer: "Library not connected", status: "ERROR" };

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = "";
      try {
        const candidates = (response as any).candidates;
        text = candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      } catch (e) {
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
