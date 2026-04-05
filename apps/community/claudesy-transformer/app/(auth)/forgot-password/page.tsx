// Claudesy CTE V2 — Forgot Password Page
"use client"

import { useState } from "react"
import Link from "next/link"
import { Lightning } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setErrorMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || "Terjadi kesalahan. Silakan coba lagi.")
        setStatus("error")
        return
      }

      setStatus("sent")
    } catch {
      setStatus("error")
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  if (status === "sent") {
    return (
      <Card className="border-[var(--border-medium)] bg-[var(--surface-primary)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
            <Lightning weight="fill" className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-[var(--text-primary)]">Cek Email Anda</CardTitle>
          <CardDescription>
            Link reset password telah dikirim ke <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-[var(--text-body)]">
            Klik link di email untuk membuat password baru. Link berlaku 1 jam.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" asChild>
            <Link href="/login">Kembali ke halaman masuk</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-[var(--border-medium)] bg-[var(--surface-primary)]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
          <Lightning weight="fill" className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-[var(--text-primary)]">Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email Anda untuk menerima link reset password
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === "error" && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-400">
            {errorMessage || "Terjadi kesalahan. Silakan coba lagi."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anda@contoh.com"
              required
              autoComplete="email"
              className="bg-[var(--surface-secondary)]"
            />
          </div>
          <Button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]"
          >
            {status === "sending" ? "Mengirim..." : "Kirim Link Reset"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-[var(--text-muted)]">
          Ingat password?{" "}
          <Link href="/login" className="text-[var(--accent-primary)] hover:underline">
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
