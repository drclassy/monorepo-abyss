// Claudesy CTE V2 — Evaluate API Route (Pro+ tier, auth required)
import { NextResponse } from "next/server"
import { EvaluateRequestSchema } from "@/types"
import { evaluatePrompt } from "@/lib/evaluator/engine"
import { logger } from "@/lib/logger"
import { checkAndTrackUsage, getUserTier } from "@/lib/billing/guard"
import {
  AppUserNotFoundError,
  requireCurrentAppUser,
  UnauthorizedError,
} from "@/lib/auth/require-current-user"
import {
  MissingProviderApiKeyError,
  resolveProviderApiKey,
} from "@/lib/llm/user-api-keys"

export async function POST(request: Request) {
  try {
    const dbUser = await requireCurrentAppUser()

    const tier = await getUserTier(dbUser.id)

    // Atomic quota check + increment (prevents race condition)
    const quota = await checkAndTrackUsage(dbUser.id, "EVALUATE", tier)
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Batas evaluasi harian tercapai",
          code: "QUOTA_EXCEEDED",
          usage: { used: quota.used, limit: quota.limit, remaining: 0 },
          upgrade: { tier: "PRO", url: "/settings?tab=subscription" },
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = EvaluateRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const apiKey = await resolveProviderApiKey(dbUser.id, parsed.data.provider)
    const result = await evaluatePrompt({
      ...parsed.data,
      apiKey,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "Silakan masuk untuk menggunakan fitur ini" },
        { status: 401 }
      )
    }

    if (error instanceof AppUserNotFoundError) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      )
    }

    if (error instanceof MissingProviderApiKeyError) {
      return NextResponse.json(
        {
          error: `No API key configured for ${error.provider}. Go to Settings to add one.`,
          code: "MISSING_PROVIDER_KEY",
        },
        { status: 400 }
      )
    }

    logger.error({ route: "evaluate" }, error)
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    )
  }
}
