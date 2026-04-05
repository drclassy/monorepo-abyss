// Claudesy CTE V2 — Optimize API Route (Pro+ tier, auth required)
import { NextResponse } from "next/server"
import { OptimizeRequestSchema } from "@/types"
import { optimizePrompt } from "@/lib/optimizer/engine"
import { logger } from "@/lib/logger"
import { checkAndTrackUsage, getUserTier, checkModelAccess } from "@/lib/billing/guard"
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
    const quota = await checkAndTrackUsage(dbUser.id, "OPTIMIZE", tier)
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Batas optimisasi harian tercapai",
          code: "QUOTA_EXCEEDED",
          usage: { used: quota.used, limit: quota.limit, remaining: 0 },
          upgrade: { tier: "PRO", url: "/settings?tab=subscription" },
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = OptimizeRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Model access check
    const modelId = parsed.data.targetLlm.toLowerCase()
    if (!checkModelAccess(tier, modelId)) {
      return NextResponse.json(
        {
          error: "Model ini tidak tersedia di tier Anda",
          code: "MODEL_RESTRICTED",
          upgrade: { tier: "PRO", url: "/settings?tab=subscription" },
        },
        { status: 403 }
      )
    }

    const apiKey = await resolveProviderApiKey(dbUser.id, parsed.data.provider)
    const result = await optimizePrompt({
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

    logger.error({ route: "optimize" }, error)
    return NextResponse.json(
      { error: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    )
  }
}
