
import { GemmaEngine } from './internal/assessment/gemma.engine';
import { VertexEngine } from './internal/brain/vertex.engine';
import { GuardEngine } from './internal/compliance/guard.engine';

/**
 * Sentra Intelligence Orchestrator (Micro-ABC)
 * Integrasi A (Assessment), B (Brain), C (Compliance)
 */
export class SentraIntelligence {
  private assessment: GemmaEngine;
  private brain: VertexEngine;
  private guard: GuardEngine;

  constructor() {
    this.assessment = new GemmaEngine();
    this.brain = new VertexEngine();
    this.guard = new GuardEngine();
  }

  async ask(question: string) {
    console.log(`\n[Intelligence] Memproses pertanyaan di area kekuasaan Gemma 2...`);

    // 1. [C] Compliance - Sanitasi Input
    const cleanQuestion = this.guard.sanitize(question);
    this.guard.audit(`Incoming Query: ${cleanQuestion.substring(0, 30)}...`);

    // 2. [B] Brain - Cari referensi medis di Cloud (Vertex RAG)
    console.log(`[Intelligence] Komponen [B] Brain mencari di 119 buku medis...`);
    const libraryResult = await this.brain.search(cleanQuestion);
    const context = libraryResult.status === 'SUCCESS' ? libraryResult.text : "Tidak ada referensi.";

    // 3. [A] Assessment - Gemma 2 (Aby) merangkum fakta
    console.log(`[Intelligence] Komponen [A] Assessment (Gemma 2) sedang menganalisa...`);
    const answer = await this.assessment.think(cleanQuestion, context);

    return {
      answer,
      grounding: libraryResult.metadata,
      status: "SUCCESS",
      model: "Aby (Gemma 2) Powered by Vertex RAG"
    };
  }
}
