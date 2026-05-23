// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
/**
 * [A] Assessment Engine — Ollama local LLM
 * Local-first GemmaEngine, default upgraded to gemma3:12b.
 */
export class GemmaEngine {
  private baseUrl: string
  private model: string

  constructor(baseUrl = 'http://localhost:11434', model = 'gemma3:12b') {
    this.baseUrl = baseUrl
    this.model = model
  }

  async think(prompt: string, context: string): Promise<string> {
    const systemPrompt = `Anda adalah Asisten Klinis Sentra Healthcare.
Gunakan referensi medis berikut untuk menjawab:

${context}

Instruksi: Berikan jawaban klinis yang akurat dan terstruktur berdasarkan referensi di atas.
Jika referensi tidak relevan, gunakan pengetahuan medis umum namun tandai dengan [General Knowledge].`

    const body = {
      model: this.model,
      prompt,
      system: systemPrompt,
      stream: false,
      options: { temperature: 0.1 },
    }

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error(`Ollama generate failed: ${res.status}`)
    const data = (await res.json()) as { response: string }
    return data.response
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`)
      if (!res.ok) return false
      const data = (await res.json()) as { models: Array<{ name: string }> }
      return data.models.some((m) => m.name.startsWith(this.model.split(':')[0]))
    } catch {
      return false
    }
  }
}
