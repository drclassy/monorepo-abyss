// Claudesy CTE V2 — Transform engine tests

import { describe, it, expect } from "vitest"
import { transformPrompt } from "@/lib/transform/engine"
import type { TransformRequest } from "@/lib/transform/schemas"

function makeRequest(overrides: Partial<TransformRequest> = {}): TransformRequest {
  return {
    prompt: "Buatkan artikel tentang kecerdasan buatan di Indonesia",
    model: "claude-sonnet",
    mode: "professional",
    temperature: 0.7,
    maxTokens: 1024,
    locale: "id",
    ...overrides,
  }
}

describe("transformPrompt", () => {
  it("returns a non-empty transformed prompt", () => {
    const result = transformPrompt(makeRequest())
    expect(result.transformedPrompt).toBeTruthy()
    expect(result.transformedPrompt.length).toBeGreaterThan(100)
  })

  it("returns a positive token estimate", () => {
    const result = transformPrompt(makeRequest())
    expect(result.tokensEstimate).toBeGreaterThan(0)
  })

  describe("mode-specific output", () => {
    it("professional mode includes formal role", () => {
      const result = transformPrompt(makeRequest({ mode: "professional" }))
      expect(result.transformedPrompt).toContain("konsultan profesional")
    })

    it("creative mode includes creative role", () => {
      const result = transformPrompt(makeRequest({ mode: "creative" }))
      expect(result.transformedPrompt).toContain("kreator konten")
    })

    it("technical mode includes engineer role", () => {
      const result = transformPrompt(makeRequest({ mode: "technical" }))
      expect(result.transformedPrompt).toContain("senior engineer")
    })

    it("academic mode includes researcher role", () => {
      const result = transformPrompt(makeRequest({ mode: "academic" }))
      expect(result.transformedPrompt).toContain("peneliti akademis")
    })

    it("casual mode includes friendly role", () => {
      const result = transformPrompt(makeRequest({ mode: "casual" }))
      expect(result.transformedPrompt).toContain("teman")
    })
  })

  describe("model-specific formatting", () => {
    it("Claude models use XML tags", () => {
      const result = transformPrompt(makeRequest({ model: "claude-sonnet" }))
      expect(result.transformedPrompt).toContain("<role>")
      expect(result.transformedPrompt).toContain("<task>")
      expect(result.transformedPrompt).toContain("<constraints>")
    })

    it("Claude Opus uses XML tags", () => {
      const result = transformPrompt(makeRequest({ model: "claude-opus" }))
      expect(result.transformedPrompt).toContain("<role>")
    })

    it("non-Claude models use markdown headers", () => {
      const result = transformPrompt(makeRequest({ model: "openai-gpt4o" }))
      expect(result.transformedPrompt).toContain("# Role")
      expect(result.transformedPrompt).toContain("# Task")
      expect(result.transformedPrompt).toContain("# Constraints")
    })

    it("Gemini uses markdown headers", () => {
      const result = transformPrompt(makeRequest({ model: "gemini-pro" }))
      expect(result.transformedPrompt).toContain("# Role")
    })
  })

  describe("locale handling", () => {
    it("Indonesian locale adds Bahasa Indonesia constraint", () => {
      const result = transformPrompt(makeRequest({ locale: "id" }))
      expect(result.transformedPrompt).toContain("Bahasa Indonesia")
    })

    it("English locale does not add Bahasa Indonesia constraint", () => {
      const result = transformPrompt(makeRequest({ locale: "en" }))
      expect(result.transformedPrompt).not.toContain("Bahasa Indonesia")
    })

    it("Indonesian locale references Indonesian audience", () => {
      const result = transformPrompt(makeRequest({ locale: "id" }))
      expect(result.transformedPrompt).toContain("Indonesia")
    })
  })

  describe("temperature influence", () => {
    it("high temperature adds creativity note", () => {
      const result = transformPrompt(makeRequest({ temperature: 1.5 }))
      expect(result.transformedPrompt).toMatch(/[Cc]reativity|[Kk]reati|Tinggi/)
    })

    it("low temperature adds precision note", () => {
      const result = transformPrompt(makeRequest({ temperature: 0.2 }))
      expect(result.transformedPrompt).toMatch(/[Aa]kurasi|[Pp]resisi|[Cc]onsisten/)
    })

    it("medium temperature adds no special note", () => {
      const result = transformPrompt(makeRequest({ temperature: 0.7 }))
      expect(result.transformedPrompt).not.toContain("unconventional")
      expect(result.transformedPrompt).not.toContain("konsistensi")
    })
  })

  describe("intent detection", () => {
    it("detects generation intent", () => {
      const result = transformPrompt(
        makeRequest({ prompt: "Buatkan email marketing untuk produk baru" })
      )
      expect(result.transformedPrompt).toContain("generation")
    })

    it("detects analysis intent", () => {
      const result = transformPrompt(
        makeRequest({ prompt: "Analisis trend e-commerce di Indonesia tahun ini" })
      )
      expect(result.transformedPrompt).toContain("analysis")
    })

    it("detects explanation intent", () => {
      const result = transformPrompt(
        makeRequest({ prompt: "Jelaskan cara kerja transformer architecture dalam AI" })
      )
      expect(result.transformedPrompt).toContain("explanation")
    })

    it("detects debugging intent", () => {
      const result = transformPrompt(
        makeRequest({ prompt: "Fix error TypeError di fungsi handleSubmit saya" })
      )
      expect(result.transformedPrompt).toContain("debugging")
    })

    it("detects summarization intent", () => {
      const result = transformPrompt(
        makeRequest({ prompt: "Ringkas dokumen penelitian ini menjadi 500 kata" })
      )
      expect(result.transformedPrompt).toContain("summarization")
    })

    it("defaults to general for ambiguous prompts", () => {
      const result = transformPrompt(
        makeRequest({ prompt: "AI dan dampaknya terhadap masyarakat modern" })
      )
      expect(result.transformedPrompt).toContain("general")
    })
  })

  describe("max tokens constraint", () => {
    it("includes max tokens in output", () => {
      const result = transformPrompt(makeRequest({ maxTokens: 2048 }))
      expect(result.transformedPrompt).toContain("2048")
    })

    it("different max tokens values appear in output", () => {
      const result = transformPrompt(makeRequest({ maxTokens: 500 }))
      expect(result.transformedPrompt).toContain("500")
    })
  })

  describe("model optimization hints", () => {
    it("includes model-specific hint", () => {
      const result = transformPrompt(makeRequest({ model: "claude-sonnet" }))
      expect(result.transformedPrompt).toContain("Model optimization")
    })

    it("DeepSeek hint mentions chain-of-thought", () => {
      const result = transformPrompt(makeRequest({ model: "deepseek-v3" }))
      expect(result.transformedPrompt).toContain("chain-of-thought")
    })
  })

  describe("original prompt inclusion", () => {
    it("includes the original prompt in the output", () => {
      const customPrompt = "Kustom prompt unik untuk testing 12345"
      const result = transformPrompt(makeRequest({ prompt: customPrompt }))
      expect(result.transformedPrompt).toContain(customPrompt)
    })
  })
})
