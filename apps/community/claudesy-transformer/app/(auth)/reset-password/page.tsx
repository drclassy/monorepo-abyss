// Claudesy CTE V2 — Reset Password Page
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok")
      return
    }

    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError("Terjadi kesalahan. Silakan coba lagi.")
        return
      }

      router.push("/optimizer")
    } catch {
      setError("Gagal terhubung ke server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-[var(--border-medium)] bg-[var(--surface-primary)]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
          <Lightning weight="fill" className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-[var(--text-primary)]">Buat Password Baru</CardTitle>
        <CardDescription>
          Masukkan password baru untuk akun Anda
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
              autoComplete="new-password"
              className="bg-[var(--surface-secondary)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Konfirmasi Password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password baru"
              required
              minLength={8}
              autoComplete="new-password"
              className="bg-[var(--surface-secondary)]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]"
          >
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-xs text-[var(--text-muted)]">
          Pastikan password baru Anda kuat dan tidak digunakan di tempat lain.
        </p>
      </CardFooter>
    </Card>
  )
}
