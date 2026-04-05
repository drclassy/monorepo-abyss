// Claudesy CTE V2 — Transform tool page (free tier)

import type { Metadata } from "next"
import { TransformLayout } from "@/components/transform/TransformLayout"

export const metadata: Metadata = {
  title: "Transform Prompt | Claudesy CTE",
  description:
    "Ubah ide mentah jadi super prompt profesional dengan Claudesy CTE V2.",
}

export default function TransformPage() {
  return (
    <section className="min-h-screen bg-white text-black py-4">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 text-center">
          <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
            TRANSFORM PROMPT
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Masukkan prompt mentah, pilih model &amp; mode, dapatkan super prompt terstruktur.
          </p>
        </div>
      </div>
      <TransformLayout />
    </section>
  )
}
