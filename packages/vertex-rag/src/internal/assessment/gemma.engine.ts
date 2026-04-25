
/**
 * [A] Assessment Engine - Gemma 2 (Aby)
 * Area Kekuasaan Gemma 2 di Monorepo Abyss
 */
export class GemmaEngine {
  private readonly baseUrl: string;
  private readonly modelName: string = 'gemma2:9b';

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async think(prompt: string, context: string) {
    const systemPrompt = `
      IDENTITY: You are Aby, a specialized AI Clinical Assistant.
      CONTEXT: Use the following medical library referrence to answer: ${context}
      INSTRUCTION: Summarize the medical guidance clearly and accurately.
    `;

    const request = {
      model: this.modelName,
      prompt: prompt,
      system: systemPrompt,
      stream: false,
      options: { temperature: 0.1 }
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json() as any;
      return data.response;
    } catch (error) {
      return "Aby Logic: Gagal berfikir (Ollama not connected). " + error;
    }
  }
}
