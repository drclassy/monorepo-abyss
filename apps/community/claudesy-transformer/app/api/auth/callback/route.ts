// Claudesy CTE V2 — OAuth Callback Route
// Exchanges auth code for session, upserts User in Prisma, auto-assigns Gratis tier

import { NextResponse } from "next/server"
import { createSupabaseActionClient } from "@/lib/supabase/action"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { prisma } from "@/lib/db/prisma"
import { enqueueWelcomeEmail, processEmailQueue } from "@/lib/email/queue"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const rawRedirect = searchParams.get("redirect") ?? "/optimizer"
  // Prevent open redirect: only allow internal paths
  const redirect =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/optimizer"

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  try {
    const supabase = await createSupabaseActionClient()
    let welcomeEmailCandidate: { userId: string; email: string; name: string | null } | null = null

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const user = data.user

    // Atomic: upsert user + ensure subscription exists in a single transaction
    await prisma.$transaction(async (tx: import('@prisma/client').Prisma.TransactionClient) => {
      const dbUser = await tx.user.upsert({
        where: { supabaseId: user.id },
        update: {
          email: user.email ?? "",
          name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        },
        create: {
          email: user.email ?? "",
          name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
          supabaseId: user.id,
          locale: "id",
        },
      })

      // Create default subscription if not exists
      const existing = await tx.subscription.findUnique({
        where: { userId: dbUser.id },
      })

      if (!existing) {
        await tx.subscription.create({
          data: {
            userId: dbUser.id,
            tier: "GRATIS",
            status: "ACTIVE",
          },
        })

        welcomeEmailCandidate = {
          userId: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
        }
      }
    })

    if (welcomeEmailCandidate) {
      try {
        await enqueueWelcomeEmail(welcomeEmailCandidate)
        void processEmailQueue({ limit: 1 }).catch(() => {
          logger.warn({ route: '/api/auth/callback' }, 'Queued welcome email could not be processed immediately')
        })
      } catch (queueError) {
        logger.warn({ route: '/api/auth/callback' }, 'Welcome email could not be queued')
        logger.error({ route: '/api/auth/callback', stage: 'queue-welcome-email' }, queueError)
      }
    }

    // Auto-assign Gratis tier in Supabase app_metadata (for JWT-based tier checks)
    if (!user.app_metadata?.tier) {
      const admin = createSupabaseAdminClient()
      await admin.auth.admin.updateUserById(user.id, {
        app_metadata: { tier: "GRATIS" },
      })
    }

    return NextResponse.redirect(`${origin}${redirect}`)
  } catch {
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }
}
