// Claudesy CTE V2 — Schema validation tests

import { describe, it, expect } from "vitest"
import {
  TransformRequestSchema,
  TransformResponseSchema,
  TransformErrorSchema,
  HistoryItemSchema,
  ModelId,
  TransformMode,
} from "@/lib/transform/schemas"

describe("ModelId enum", () => {
  it("accepts valid model IDs", () => {
    expect(ModelId.parse("claude-sonnet")).toBe("claude-sonnet")
    expect(ModelId.parse("openai-gpt4o")).toBe("openai-gpt4o")
    expect(ModelId.parse("gemini-pro")).toBe("gemini-pro")
  })

  it("rejects invalid model IDs", () => {
    expect(() => ModelId.parse("gpt-3")).toThrow()
    expect(() => ModelId.parse("")).toThrow()
    expect(() => ModelId.parse(123)).toThrow()
  })
})

describe("TransformMode enum", () => {
  it("accepts valid modes", () => {
    expect(TransformMode.parse("professional")).toBe("professional")
    expect(TransformMode.parse("creative")).toBe("creative")
    expect(TransformMode.parse("technical")).toBe("technical")
    expect(TransformMode.parse("academic")).toBe("academic")
    expect(TransformMode.parse("casual")).toBe("casual")
  })

  it("rejects invalid modes", () => {
    expect(() => TransformMode.parse("formal")).toThrow()
    expect(() => TransformMode.parse("")).toThrow()
  })
})

describe("TransformRequestSchema", () => {
  const validRequest = {
    prompt: "Buatkan artikel tentang AI di Indonesia",
    model: "claude-sonnet",
    mode: "professional",
    temperature: 0.7,
    maxTokens: 1024,
    locale: "id",
  }

  it("accepts valid request", () => {
    const result = TransformRequestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it("applies defaults for optional fields", () => {
    const result = TransformRequestSchema.parse({
      prompt: "Ini prompt minimal valid ya",
    })
    expect(result.model).toBe("claude-sonnet")
    expect(result.mode).toBe("professional")
    expect(result.temperature).toBe(0.7)
    expect(result.maxTokens).toBe(1024)
    expect(result.locale).toBe("id")
  })

  it("rejects prompt shorter than 10 chars", () => {
    const result = TransformRequestSchema.safeParse({
      ...validRequest,
      prompt: "terlalu",
    })
    expect(result.success).toBe(false)
  })

  it("rejects prompt longer than 5000 chars", () => {
    const result = TransformRequestSchema.safeParse({
      ...validRequest,
      prompt: "a".repeat(5001),
    })
    expect(result.success).toBe(false)
  })

  it("trims whitespace from prompt", () => {
    const result = TransformRequestSchema.parse({
      ...validRequest,
      prompt: "  Ini prompt dengan spasi berlebihan  ",
    })
    expect(result.prompt).toBe("Ini prompt dengan spasi berlebihan")
  })

  it("rejects temperature out of range", () => {
    expect(
      TransformRequestSchema.safeParse({ ...validRequest, temperature: -1 })
        .success
    ).toBe(false)
    expect(
      TransformRequestSchema.safeParse({ ...validRequest, temperature: 3 })
        .success
    ).toBe(false)
  })

  it("accepts boundary temperatures", () => {
    expect(
      TransformRequestSchema.safeParse({ ...validRequest, temperature: 0 })
        .success
    ).toBe(true)
    expect(
      TransformRequestSchema.safeParse({ ...validRequest, temperature: 2 })
        .success
    ).toBe(true)
  })

  it("rejects maxTokens out of range", () => {
    expect(
      TransformRequestSchema.safeParse({ ...validRequest, maxTokens: 50 })
        .success
    ).toBe(false)
    expect(
      TransformRequestSchema.safeParse({ ...validRequest, maxTokens: 5000 })
        .success
    ).toBe(false)
  })

  it("handles XSS payloads in prompt (sanitization via trim)", () => {
    const xssPayload = '<script>alert("xss")</script> Ini prompt valid ya lah'
    const result = TransformRequestSchema.safeParse({
      ...validRequest,
      prompt: xssPayload,
    })
    expect(result.success).toBe(true)
  })
})

describe("TransformResponseSchema", () => {
  it("accepts valid response", () => {
    const result = TransformResponseSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      originalPrompt: "test prompt ya lah hehe",
      transformedPrompt: "# Role\nYou are...",
      model: "claude-sonnet",
      mode: "professional",
      metadata: {
        tokensEstimate: 150,
        transformedAt: "2026-03-22T10:00:00.000Z",
        processingTimeMs: 42,
      },
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid UUID", () => {
    const result = TransformResponseSchema.safeParse({
      id: "not-a-uuid",
      originalPrompt: "test",
      transformedPrompt: "test",
      model: "claude-sonnet",
      mode: "professional",
      metadata: {
        tokensEstimate: 150,
        transformedAt: "2026-03-22T10:00:00.000Z",
        processingTimeMs: 42,
      },
    })
    expect(result.success).toBe(false)
  })
})

describe("TransformErrorSchema", () => {
  it("accepts valid error", () => {
    const result = TransformErrorSchema.safeParse({
      error: "Something went wrong",
      code: "INTERNAL",
    })
    expect(result.success).toBe(true)
  })

  it("accepts error with details", () => {
    const result = TransformErrorSchema.safeParse({
      error: "Prompt terlalu pendek",
      code: "VALIDATION_ERROR",
      details: { field: "prompt", min: "10" },
    })
    expect(result.success).toBe(true)
  })

  it("rejects unknown error codes", () => {
    const result = TransformErrorSchema.safeParse({
      error: "test",
      code: "UNKNOWN_CODE",
    })
    expect(result.success).toBe(false)
  })
})

describe("HistoryItemSchema", () => {
  it("accepts valid history item with default starred", () => {
    const result = HistoryItemSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      originalPrompt: "test",
      transformedPrompt: "transformed",
      model: "claude-sonnet",
      mode: "creative",
      createdAt: "2026-03-22T10:00:00.000Z",
    })
    expect(result.starred).toBe(false)
  })
})
