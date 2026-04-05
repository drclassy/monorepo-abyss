// Claudesy CTE V2 — Login Page (Supabase Auth)
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get("redirect") ?? "/optimizer"
  // Prevent open redirect: only allow internal paths (no // or external URLs)
  const redirect =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/optimizer"

  // Map callback error codes to user-friendly messages
  const callbackErrorMap: Record<string, string> = {
    missing_code: "Link verifikasi tidak valid. Silakan daftar ulang.",
    auth_failed: "Link verifikasi sudah kedaluwarsa. Silakan kirim ulang email verifikasi.",
    callback_failed: "Terjadi kesalahan saat verifikasi. Silakan coba lagi.",
  }
  const callbackError = searchParams.get("error")
  const initialError = callbackError ? (callbackErrorMap[callbackError] ?? "Terjadi kesalahan. Silakan coba lagi.") : ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("Email atau password salah")
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Email belum diverifikasi. Cek inbox Anda.")
        } else {
          setError("Terjadi kesalahan. Silakan coba lagi.")
        }
        return
      }

      router.push(redirect)
      router.refresh()
    } catch {
      setError("Gagal terhubung ke server")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
  }

  return (
    <Card className="border-[var(--border-medium)] bg-[var(--surface-primary)]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
          <Lightning weight="fill" className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-[var(--text-primary)]">Masuk</CardTitle>
        <CardDescription>Masuk ke akun Claudesy CTE Anda</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Masuk dengan Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border-subtle)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--surface-primary)] px-2 text-[var(--text-muted)]">
              atau
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
              >
                Lupa password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
              className="bg-[var(--surface-secondary)]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]"
          >
            {loading ? "Sedang masuk..." : "Masuk"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-[var(--text-muted)]">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[var(--accent-primary)] hover:underline">
            Daftar gratis
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
