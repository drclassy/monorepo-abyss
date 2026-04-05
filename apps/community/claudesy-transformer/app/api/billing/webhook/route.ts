// Claudesy CTE V2 — POST /api/billing/webhook
// Handles Xendit payment webhooks (invoice paid/expired/failed)
// No auth middleware — uses X-CALLBACK-TOKEN verification

import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyWebhookToken } from "@/lib/billing/xendit-client"
import { activateSubscription, handlePaymentFailed } from "@/lib/billing/subscription-service"
import { logger } from "@/lib/logger"

const XenditWebhookPayloadSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  status: z.string(),
  amount: z.number(),
  paid_amount: z.number().optional(),
  payment_method: z.string().optional(),
  payment_channel: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    // Verify Xendit callback token
    const callbackToken = request.headers.get("x-callback-token")
    if (!callbackToken || !verifyWebhookToken(callbackToken)) {
      return NextResponse.json(
        { error: "Invalid callback token" },
        { status: 403 }
      )
    }

    const raw: unknown = await request.json()
    const parsed = XenditWebhookPayloadSchema.safeParse(raw)
    if (!parsed.success) {
      logger.warn(
        { route: "billing/webhook", details: parsed.error.flatten() },
        "Invalid webhook payload shape"
      )
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const payload = parsed.data

    switch (payload.status) {
      case "PAID":
      case "SETTLED": {
        await activateSubscription({
          gatewayPaymentId: payload.id,
          paymentMethod: payload.payment_method ?? payload.payment_channel ?? "UNKNOWN",
          paidAmount: payload.paid_amount ?? payload.amount,
        })
        break
      }

      case "EXPIRED":
      case "FAILED": {
        await handlePaymentFailed(payload.id, payload.status)
        break
      }

      default:
        // Ignore other statuses (PENDING, etc.)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error({ route: "billing/webhook" }, error)
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    )
  }
}
