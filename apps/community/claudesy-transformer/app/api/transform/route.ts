// Claudesy CTE V2 — POST /api/transform
// Free-tier: validates input, transforms prompt, returns structured response
// No auth required — rate limited by IP

import { NextResponse } from "next/server"
import { TransformRequestSchema } from "@/lib/transform/schemas"
import { transformPrompt } from "@/lib/transform/engine"
import { TRANSFORM_LIMITS } from "@/lib/transform/constants"

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= TRANSFORM_LIMITS.rateLimitPerMinute) {
    return false
  }

  entry.count++
  return true
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown"

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "Terlalu banyak permintaan. Coba lagi dalam 1 menit.",
          code: "RATE_LIMIT" as const,
        },
        { status: 429 }
      )
    }

    const body: unknown = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        {
          error: "Request body tidak valid",
          code: "VALIDATION_ERROR" as const,
        },
        { status: 400 }
      )
    }

    const parsed = TransformRequestSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return NextResponse.json(
        {
          error: firstError?.message ?? "Input tidak valid",
          code: "VALIDATION_ERROR" as const,
          details: {
            field: firstError?.path.join(".") ?? "unknown",
          },
        },
        { status: 400 }
      )
    }

    const startTime = performance.now()
    const result = transformPrompt(parsed.data)
    const processingTimeMs = Math.round(performance.now() - startTime)

    const response = {
      id: crypto.randomUUID(),
      originalPrompt: parsed.data.prompt,
      transformedPrompt: result.transformedPrompt,
      model: parsed.data.model,
      mode: parsed.data.mode,
      metadata: {
        tokensEstimate: result.tokensEstimate,
        transformedAt: new Date().toISOString(),
        processingTimeMs,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch {
    return NextResponse.json(
      {
        error: "Terjadi kesalahan internal",
        code: "INTERNAL" as const,
      },
      { status: 500 }
    )
  }
}
