// Claudesy CTE V2 — Email Verification Page
"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Lightning, EnvelopeSimple } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleResend() {
    if (!email || resendStatus === "sending") return
    setResendStatus("sending")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setResendStatus(response.ok ? "sent" : "error")
    } catch {
      setResendStatus("error")
    }
  }

  return (
    <Card className="border-[var(--border-medium)] bg-[var(--surface-primary)]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
          <Lightning weight="fill" className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-[var(--text-primary)]">Cek Email Anda</CardTitle>
        <CardDescription>
          Kami telah mengirim link verifikasi ke email Anda
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-primary)]/10">
          <EnvelopeSimple className="h-8 w-8 text-[var(--accent-primary)]" />
        </div>

        <div className="space-y-2">
          {email && (
            <p className="text-sm font-medium text-[var(--text-primary)]">{email}</p>
          )}
          <p className="text-sm text-[var(--text-body)]">
            Klik link di email untuk mengaktifkan akun Anda.
            Link akan kedaluwarsa dalam 24 jam.
          </p>
        </div>

        {email && (
          <div className="space-y-2">
            {resendStatus === "sent" ? (
              <p className="text-sm text-green-500">Email verifikasi berhasil dikirim ulang.</p>
            ) : resendStatus === "error" ? (
              <p className="text-sm text-red-400">Gagal mengirim ulang. Coba beberapa saat lagi.</p>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">Tidak menerima email? Cek folder spam atau</p>
            )}

            {resendStatus !== "sent" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resendStatus === "sending"}
                className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)]"
              >
                {resendStatus === "sending" ? "Mengirim..." : "Kirim ulang email verifikasi"}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <Button variant="outline" asChild>
          <Link href="/login">Kembali ke halaman masuk</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
