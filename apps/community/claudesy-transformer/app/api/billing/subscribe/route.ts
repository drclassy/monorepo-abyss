// Claudesy CTE V2 — POST /api/billing/subscribe
// Creates a Xendit invoice for subscription upgrade

import { NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseActionClient } from "@/lib/supabase/action"
import { createSubscriptionInvoice } from "@/lib/billing/subscription-service"
import { prisma } from "@/lib/db/prisma"

const SubscribeRequestSchema = z.object({
  tier: z.enum(["PRO", "TIM", "ENTERPRISE"]),
  interval: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
})

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createSupabaseActionClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Silakan masuk terlebih dahulu" },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: "Request body tidak valid" },
        { status: 400 }
      )
    }

    const parsed = SubscribeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parameter tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Get Prisma user
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { subscription: true },
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if already on requested tier
    if (dbUser.subscription?.tier === parsed.data.tier && dbUser.subscription?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Anda sudah berlangganan paket ini" },
        { status: 400 }
      )
    }

    // Ensure subscription record exists
    if (!dbUser.subscription) {
      await prisma.subscription.create({
        data: { userId: dbUser.id, tier: "GRATIS", status: "ACTIVE" },
      })
    }

    // Create Xendit invoice
    const { invoiceUrl, paymentId } = await createSubscriptionInvoice({
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name ?? "User",
      tier: parsed.data.tier,
      interval: parsed.data.interval,
    })

    return NextResponse.json({
      invoiceUrl,
      paymentId,
      message: "Silakan selesaikan pembayaran",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
