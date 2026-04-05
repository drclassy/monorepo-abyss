// Claudesy CTE V2 — GET /api/usage
// Returns current user's usage summary + tier info

import { NextResponse } from "next/server"
import { createSupabaseActionClient } from "@/lib/supabase/action"
import { getUserTier, getUsageSummary } from "@/lib/billing/guard"
import { TIER_LIMITS, TIER_LABELS } from "@/lib/billing/plans"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const supabase = await createSupabaseActionClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const tier = await getUserTier(dbUser.id)
    const usage = await getUsageSummary(dbUser.id, tier)
    const limits = TIER_LIMITS[tier]

    return NextResponse.json({
      tier,
      tierLabel: TIER_LABELS[tier],
      limits,
      usage,
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
